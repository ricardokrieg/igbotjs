const { logHandler } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);


class SessionManager {
  constructor({ ig, dbManager, username }) {
    this.ig        = ig;
    this.dbManager = dbManager;
    this.username  = username;

    this.cookies = null;
    this.state   = null;
  }

  start() {
    log('Starting...');

    this.ig.request.end$.subscribe(this.requestSubscription.bind(this));

    log('Started');
  }

  async login() {
    log('Logging in...');

    await this.loadCookies();
    await this.loadState();

    log('Simulating pre login flow...');
    await this.ig.simulate.preLoginFlow();

    log('Simulating post login flow...');
    await this.ig.simulate.postLoginFlow();

    log('Logged in');
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

    this.cookies = (await this.dbManager.accountsCol().findOne({ _id: this.username })).cookies;

    log(this.cookies);

    await this.ig.state.deserializeCookieJar(JSON.stringify(this.cookies));
  }

  static async loadState() {
    log('Loading state...');

    this.state = (await this.dbManager.accountsCol().findOne({ _id: this.username })).state;

    log(this.state);

    this.ig.state.deviceString = this.state.deviceString;
    this.ig.state.deviceId = this.state.deviceId;
    this.ig.state.uuid = this.state.uuid;
    this.ig.state.phoneId = this.state.phoneId;
    this.ig.state.adid = this.state.adid;
    this.ig.state.build = this.state.build;
  }

  async call(command, ...params) {
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
        resolve(r);
      } else {
        reject(error);
      }
    });
  }
}

module.exports = SessionManager;