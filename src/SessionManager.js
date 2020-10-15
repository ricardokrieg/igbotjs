const { find } = require('lodash');
const Bluebird = require('bluebird');
const inquirer = require('inquirer');
const { IgCheckpointError } = require('instagram-private-api');
const { logHandler, quickSleep } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);


class SessionManager {
  constructor({ ig, dbManager, username, accountDetails }) {
    this.ig        = ig;
    this.dbManager = dbManager;
    this.username  = username;

    this.cookies  = accountDetails.cookies;
    this.state    = accountDetails.state;
    this.password = accountDetails.password;
  }

  start() {
    log('Starting...');

    this.ig.request.end$.subscribe(this.requestSubscription.bind(this));

    log('Started');
  }

  async login() {
    log('Logging in...');

    if (this.state && this.validCookies()) {
      await this.loadCookies();
      await this.loadState();

      // log('Simulating pre login flow...');
      // log.warn(`---> Maybe should not call preLoginFlow <---`);
      // await this.ig.simulate.preLoginFlow();

      log('Simulating post login flow...');
      await this.ig.simulate.postLoginFlow();

      log('Logged in');
    } else {
      log.warn('Cookies/State are missing');

      this.ig.state.generateDevice(this.username);

      log('Simulating pre login flow...');
      await this.ig.simulate.preLoginFlow();

      await Bluebird.try(async () => {
        await this.passwordLogin();
      }).catch(IgCheckpointError, async () => {
        log.warn('Checkpoint: ');
        log(this.ig.state.checkpoint);

        await this.ig.challenge.auto(true);

        log.warn('Checkpoint: ');
        log(this.ig.state.checkpoint);

        const { code } = await inquirer.prompt([
          {
            type: 'input',
            name: 'code',
            message: 'Enter code',
          },
        ]);
        log(`Sending code ${code}...`);

        const result = await this.ig.challenge.sendSecurityCode(code);
        log(result);

        await this.passwordLogin();
      });
    }
  }

  async logout() {
    log('Logging out...');

    await this.ig.account.logout();
    await quickSleep();
    await this.dbManager.clearCookies();

    log('Logged out');
  }

  async createAccount(acc, generateDevice=false) {
    log('Creating account...');
    log(acc);

    this.dbManager.setUsername(acc.username);

    if (generateDevice) {
      this.ig.state.generateDevice(acc.username);

      log('Simulating pre login flow...');
      await this.ig.simulate.preLoginFlow();
    }

    return await Bluebird.try(async () => {
      return await this.ig.account.create(acc);
    }).catch(IgCheckpointError, async () => {
      log.warn('Checkpoint: ');
      log(this.ig.state.checkpoint);

      const { code } = await inquirer.prompt([
        {
          type: 'input',
          name: 'code',
          message: 'Enter code',
        },
      ]);
      log(`Sending code ${code}...`);

      const result = await this.ig.challenge.sendSecurityCode(code);
      log(result);

      return await this.ig.account.create(acc);
    });
  }

  async newCreateAccount(acc) {
    log('Creating account...');
    log(acc);

    this.ig.state.generateDevice(acc.username);

    log('Simulating pre login flow...');
    await this.ig.simulate.preLoginFlow();

    const { body } = await this.ig.request.send({
      method: 'POST',
      url: '/api/v1/users/check_email/',
      form: this.ig.request.sign({
        email: acc.email,
        guid: this.ig.state.uuid,
        device_id: this.ig.state.deviceId,
        _csrftoken: this.ig.state.cookieCsrfToken,
        waterfall_id: this.ig.state.uuid,
      })
    });

    log(body);

    if (!body['valid']) {
      throw new Error("Invalid email");
    }

    let response = await this.ig.request.send({
      method: 'GET',
      url: `/api/v1/consent/get_signup_config/?guid=${this.ig.state.uuid}&main_account_selected=false`,
    });
    let body2 = response.body;

    log(body2);

    let response3 = await this.ig.request.send({
      method: 'POST',
      url: '/api/v1/accounts/send_verify_email/',
      form: this.ig.request.sign({
        email: acc.email,
        auto_confirm_only: false,
        guid: this.ig.state.uuid,
        device_id: this.ig.state.deviceId,
        _csrftoken: this.ig.state.cookieCsrfToken,
        waterfall_id: this.ig.state.uuid,
      })
    });
    let body3 = response3.body;

    log(body3);

    const code = (await inquirer.prompt([
      {
        type: 'input',
        name: 'code',
        message: 'Code',
      },
    ]))['code'];

    let response4 = await this.ig.request.send({
      method: 'POST',
      url: '/api/v1/accounts/check_confirmation_code/',
      form: this.ig.request.sign({
        email: acc.email,
        code,
        guid: this.ig.state.uuid,
        device_id: this.ig.state.deviceId,
        _csrftoken: this.ig.state.cookieCsrfToken,
        waterfall_id: this.ig.state.uuid,
      })
    });
    let body4 = response4.body;
    const signup_code = body4['signup_code'];

    log(body4);

    let response5 = await this.ig.request.send({
      method: 'POST',
      url: '/api/v1/accounts/username_suggestions/',
      form: this.ig.request.sign({
        email: acc.email,
        name: acc.name,
        guid: this.ig.state.uuid,
        device_id: this.ig.state.deviceId,
        _csrftoken: this.ig.state.cookieCsrfToken,
        waterfall_id: this.ig.state.uuid,
      })
    });
    let body5 = response5.body;

    log(body5);

    let response6 = await this.ig.request.send({
      method: 'POST',
      url: '/api/v1/consent/check_age_eligibility/',
      form: {
        day: 30,
        year: 1989,
        month: 5,
      }
    });
    let body6 = response6.body;

    log(body6);

    let response7 = await this.ig.request.send({
      method: 'POST',
      url: '/api/v1/consent/new_user_flow_begins/',
      form: this.ig.request.sign({
        device_id: this.ig.state.deviceId,
        _csrftoken: this.ig.state.cookieCsrfToken,
      })
    });
    let body7 = response7.body;

    log(body7);

    const { encrypted, time } = this.ig.account.encryptPassword(acc.password);

    const createJazoest = (input) => {
      const buf = Buffer.from(input, 'ascii');
      let sum = 0;
      for (let i = 0; i < buf.byteLength; i++) {
        sum += buf.readUInt8(i);
      }
      return `2${sum}`;
    };

    log(this.ig.request.sign({
      is_secondary_account_creation: 'false',
      jazoest: createJazoest(this.ig.state.phoneId),
      tos_version: 'row',
      suggestedUsername: '',
      sn_result: '',
      do_not_auto_login_if_credentials_match: 'true',
      enc_password: `#PWD_INSTAGRAM:4:${time}:${encrypted}`,
      force_signup_code: signup_code,
      one_tap_opt_in: 'true',

      email: acc.email,
      username: acc.username,
      first_name: acc.name,
      day: '30',
      month: '5',
      year: '1989',

      phone_id: this.ig.state.phoneId,
      guid: this.ig.state.uuid,
      device_id: this.ig.state.deviceId,
      _csrftoken: this.ig.state.cookieCsrfToken,
      waterfall_id: this.ig.state.uuid,
    }));

    let response8 = await this.ig.request.send({
      method: 'POST',
      url: '/api/v1/accounts/create/',
      form: this.ig.request.sign({
        is_secondary_account_creation: 'false',
        jazoest: createJazoest(this.ig.state.phoneId),
        tos_version: 'row',
        suggestedUsername: '',
        sn_result: '',
        do_not_auto_login_if_credentials_match: 'true',
        enc_password: `#PWD_INSTAGRAM:4:${time}:${encrypted}`,
        force_signup_code: signup_code,
        one_tap_opt_in: 'true',

        email: acc.email,
        username: acc.username,
        first_name: acc.name,
        day: '30',
        month: '5',
        year: '1989',

        phone_id: this.ig.state.phoneId,
        guid: this.ig.state.uuid,
        device_id: this.ig.state.deviceId,
        _csrftoken: this.ig.state.cookieCsrfToken,
        waterfall_id: this.ig.state.uuid,
      })
    });
    let body8 = response8.body;

    log(body8);
  }

  async createAccountWithPhoneNumber(acc) {
    log('Creating account with phone number...');
    log(acc);

    this.ig.state.generateDevice(acc.username);

    log('Simulating pre login flow...');
    await this.ig.simulate.preLoginFlow();

    const input_phone_number = async () => {
      const { phone_prefix, phone_number } = await inquirer.prompt([
        {
          type: 'input',
          name: 'phone_prefix',
          message: 'Phone Prefix:',
        },
        {
          type: 'input',
          name: 'phone_number',
          message: 'Phone Number:',
        },
      ]);

      return { phone_prefix, phone_number };
    }

    const input_code = async ({ phone_prefix, phone_number }) => {
      const { verification_code } = await inquirer.prompt([
        {
          type: 'input',
          name: 'verification_code',
          message: `Verification Code for ${phone_prefix} ${phone_number}`,
        },
      ]);

      return verification_code;
    }

    await this.ig.account.createWithPhoneNumber({ ...acc, input_phone_number, input_code });

    // TODO these requests were sent to b.i.instagram.com host
    // TODO check if they are always sent to this host after sign up
    await this.ig.simulate.postSignupFlow();
  }

  async createAccountPhoneNumber(acc) {
    log('Creating account with phone number...');
    log(acc);

    this.ig.state.generateDevice(acc.username);

    log('Simulating pre login flow...');
    await this.ig.simulate.preLoginFlow();

    const params = 'SIGNATURE.' + JSON.stringify({
        phone_id: this.ig.state.phoneId,
        login_nonce_map: '{}',
        phone_number: acc.phone_number,
        _csrftoken: this.ig.state.cookieCsrfToken,
        guid: this.ig.state.uuid,
        device_id: this.ig.state.deviceId,
        prefill_shown: 'False',
    });

    log(params);

    try {
      const { body } = await this.ig.request.send({
        method: 'POST',
        url: '/api/v1/accounts/check_phone_number/',
        form: {
          signed_body: params
        }
      });

      log(body);

      if (body['status'] !== 'ok') {
        throw new Error("Invalid phone number");
      }
    } catch (e) {
      log(e.response.body);
      throw e;
    }

    let response3 = await this.ig.request.send({
      method: 'POST',
      url: '/api/v1/accounts/send_signup_sms_code/',
      form: this.ig.request.sign({
        phone_number: acc.full_phone_number,
        auto_confirm_only: false,
        guid: this.ig.state.uuid,
        device_id: this.ig.state.deviceId,
        _csrftoken: this.ig.state.cookieCsrfToken,
        waterfall_id: this.ig.state.uuid,
        android_build_type: 'release',
      })
    });
    let body3 = response3.body;

    log(body3);

    if (body3['status'] !== 'ok') {
      throw new Error("Invalid phone number");
    }

    const code = (await inquirer.prompt([
      {
        type: 'input',
        name: 'code',
        message: 'Code',
      },
    ]))['code'];

    let response4 = await this.ig.request.send({
      method: 'POST',
      url: '/api/v1/accounts/validate_signup_sms_code/',
      form: this.ig.request.sign({
        phone_number: acc.full_phone_number,
        verification_code: code,
        guid: this.ig.state.uuid,
        device_id: this.ig.state.deviceId,
        _csrftoken: this.ig.state.cookieCsrfToken,
        waterfall_id: this.ig.state.uuid,
      })
    });
    let body4 = response4.body;

    log(body4);

    if (body4['status'] !== 'ok') {
      throw new Error("Invalid phone number");
    }

    if (!body4['verified']) {
      throw new Error("Invalid Code");
    }

    if (body4['pn_taken']) {
      throw new Error("Phone number is taken");
    }

    let response5 = await this.ig.request.send({
      method: 'POST',
      url: '/api/v1/accounts/username_suggestions/',
      form: this.ig.request.sign({
        email: '',
        name: acc.name,
        guid: this.ig.state.uuid,
        device_id: this.ig.state.deviceId,
        _csrftoken: this.ig.state.cookieCsrfToken,
        waterfall_id: this.ig.state.uuid,
      })
    });
    let body5 = response5.body;

    log(body5);

    let response6 = await this.ig.request.send({
      method: 'POST',
      url: '/api/v1/consent/check_age_eligibility/',
      form: {
        day: 30,
        year: 1989,
        month: 5,
        _csrftoken: this.ig.state.cookieCsrfToken,
      }
    });
    let body6 = response6.body;

    log(body6);

    let response7 = await this.ig.request.send({
      method: 'POST',
      url: '/api/v1/consent/new_user_flow_begins/',
      form: this.ig.request.sign({
        device_id: this.ig.state.deviceId,
        _csrftoken: this.ig.state.cookieCsrfToken,
      })
    });
    let body7 = response7.body;

    log(body7);

    const { encrypted, time } = this.ig.account.encryptPassword(acc.password);

    const createJazoest = (input) => {
      const buf = Buffer.from(input, 'ascii');
      let sum = 0;
      for (let i = 0; i < buf.byteLength; i++) {
        sum += buf.readUInt8(i);
      }
      return `2${sum}`;
    };

    log(this.ig.request.sign({
      is_secondary_account_creation: 'false',
      jazoest: createJazoest(this.ig.state.phoneId),
      tos_version: 'row',
      suggestedUsername: '',
      verification_code: code,
      sn_result: '',
      do_not_auto_login_if_credentials_match: 'true',
      enc_password: `#PWD_INSTAGRAM:4:${time}:${encrypted}`,
      force_signup_code: '',
      one_tap_opt_in: 'true',
      has_sms_consent: 'true',

      phone_number: acc.full_phone_number,
      email: acc.email,
      username: acc.username,
      first_name: acc.name,
      day: '30',
      month: '5',
      year: '1989',

      phone_id: this.ig.state.phoneId,
      adid: this.ig.state.adid,
      guid: this.ig.state.uuid,
      device_id: this.ig.state.deviceId,
      _csrftoken: this.ig.state.cookieCsrfToken,
      waterfall_id: this.ig.state.uuid,
    }));

    let response8 = await this.ig.request.send({
      method: 'POST',
      url: '/api/v1/accounts/create_validated/',
      form: this.ig.request.sign({
        is_secondary_account_creation: 'false',
        jazoest: createJazoest(this.ig.state.phoneId),
        tos_version: 'row',
        suggestedUsername: '',
        verification_code: code,
        sn_result: '',
        do_not_auto_login_if_credentials_match: 'true',
        enc_password: `#PWD_INSTAGRAM:4:${time}:${encrypted}`,
        force_signup_code: '',
        one_tap_opt_in: 'true',
        has_sms_consent: 'true',

        phone_number: acc.full_phone_number,
        email: acc.email,
        username: acc.username,
        first_name: acc.name,
        day: '30',
        month: '5',
        year: '1989',

        phone_id: this.ig.state.phoneId,
        adid: this.ig.state.adid,
        guid: this.ig.state.uuid,
        device_id: this.ig.state.deviceId,
        _csrftoken: this.ig.state.cookieCsrfToken,
        waterfall_id: this.ig.state.uuid,
      })
    });
    let body8 = response8.body;

    log(body8);
  }

  async requestSubscription() {
    const cookies = await this.ig.state.serializeCookieJar();
    const state = {
      deviceString: this.ig.state.deviceString,
      deviceId: this.ig.state.deviceId,
      uuid: this.ig.state.uuid,
      phoneId: this.ig.state.phoneId,
      adid: this.ig.state.adid,
      build: this.ig.state.build,
    };

    await this.dbManager.updateCookiesAndState({ cookies, state });
  }

  async loadCookies() {
    log('Loading cookies...');

    await this.ig.state.deserializeCookieJar(JSON.stringify(this.cookies));
  }

  async loadState() {
    log('Loading state...');

    this.ig.state.deviceString = this.state.deviceString;
    this.ig.state.deviceId     = this.state.deviceId;
    this.ig.state.uuid         = this.state.uuid;
    this.ig.state.phoneId      = this.state.phoneId;
    this.ig.state.adid         = this.state.adid;
    this.ig.state.build        = this.state.build;
  }

  async passwordLogin() {
    log('Performing password login...');

    const auth = await this.ig.account.login(this.username, this.password);

    log('SUCCESS!');

    log('Simulating post login flow...');
    await this.ig.simulate.postLoginFlow();

    log('Logged in');
  }

  validCookies() {
    return (this.cookies && this.cookies.cookies && find(this.cookies.cookies, { 'key': 'ds_user_id' }));
  }

  static async call(command, ...params) {
    return new Promise(async (resolve, reject) => {
      let r;
      let tries = 0;
      let error = null;
      while (true) {
        try {
          tries++;

          r = await command(params);

          break;
        } catch (err) {
          log.error(err);

          if (err.name === 'IgActionSpamError') {
            error = err;
            break;
          } else {
            if (tries < 5) {
              await new Promise(resolve => setTimeout(resolve, 5000));
            } else {
              error = err;
              break;
            }
          }
        }
      }

      if (error === null) {
        await quickSleep();
        resolve(r);
      } else {
        reject(error);
      }
    });
  }
}

module.exports = SessionManager;
