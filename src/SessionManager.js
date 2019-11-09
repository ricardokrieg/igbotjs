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
    await this.ig.account.logout();
  }

  async createAccount(acc) {
    return await this.ig.account.create(acc);
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
    return (this.cookies && this.cookies.cookies && find(this.cookies.cookies, { 'key': 'ds_user' }));
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
