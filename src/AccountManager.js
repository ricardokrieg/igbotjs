const { isUndefined } = require('lodash');
const moment = require('moment');
const { logHandler } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const fs = require('fs');
const SessionManager = require('./SessionManager');
const PublishManager = require('./actions/PublishManager');


class AccountManager {
  constructor({
    username,
    accountDetails,
    ig,
    readAccountStartedAt,
    readAccountLastRun,
    updateAccountDetails,
  }) {
    this.username       = username;
    this.accountDetails = accountDetails;
    this.ig             = ig;

    this.readAccountStartedAt   = readAccountStartedAt;
    this.readAccountLastRun     = readAccountLastRun;
    this.updateAccountDetails   = updateAccountDetails;
  }

  getAccountDetails() {
    return this.accountDetails;
  }

  getFollowLimit() {
    return this.accountDetails.followLimit;
  }

  getPublishLimit() {
    return this.accountDetails.publishLimit;
  }

  getStoriesLimit() {
    return this.accountDetails.storiesLimit;
  }

  getFeedLimit() {
    return this.accountDetails.feedLimit;
  }

  getProxy() {
    return this.accountDetails.proxy;
  }

  setup() {
    const proxy = this.getProxy();
    if (proxy) {
      this.ig.state.proxyUrl = proxy;
      log(`Proxy: ${this.ig.state.proxyUrl}`);
    } else {
      log.warn('NO PROXY');
    }
  }

  async getAccountAge() {
    const startedAt = await this.readAccountStartedAt();

    if (startedAt) {
      return moment.duration(moment().diff(moment(startedAt))).days();
    } else {
      await this.updateAccountDetails({ startedAt: moment().format() });
      return 0;
    }
  }

  async lastRun({ newLastRun }) {
    const currentLastRun = await this.readAccountLastRun();

    if (currentLastRun) {
      return moment(currentLastRun);
    } else {
      return newLastRun;
    }
  }

  async editProfile({ username, name, bio, url, gender, phoneNumber, email, profilePic }) {
    const currentUser = await this.ig.account.currentUser();
    log(currentUser);

    if (isUndefined(username) && isUndefined(name) && isUndefined(bio) && isUndefined(url) && isUndefined(gender) && isUndefined(phoneNumber) && isUndefined(email)) {
      log.warn(`Nothing to edit`);
    } else {
      let options = {
        external_url: isUndefined(url) ? currentUser.external_url : url,
        gender: isUndefined(gender) ? currentUser.gender : gender,
        phone_number: isUndefined(phoneNumber) ? currentUser.phone_number : phoneNumber,
        username: isUndefined(username) ? currentUser.username : username,
        first_name: isUndefined(name) ? currentUser.full_name : name,
        biography: isUndefined(bio) ? currentUser.biography : bio,
        email: isUndefined(email) ? currentUser.email : email,
      };
      log('Options:');
      log(options);

      log('Editing profile...');
      const result = await SessionManager.call(() => this.ig.account.editProfile(options) );
      log(result);
    }

    if (profilePic) {
      log(`Applying EXIF...`);
      await PublishManager.applyExif({
        filePath: profilePic,
        basePath: `./base.jpg`,
      });

      log('Changing profile picture...');
      const readStream = fs.createReadStream(profilePic);
      const resultPic = await SessionManager.call(() => this.ig.account.changeProfilePicture(readStream) );
      log(resultPic);
    }

    log('Done');
  }
}

module.exports = AccountManager;
