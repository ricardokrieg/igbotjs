const { logHandler } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const fs = require('fs');
const SessionManager = require('./SessionManager');


class AccountManager {
  constructor({ username, accountDetails, ig }) {
    this.username       = username;
    this.accountDetails = accountDetails;
    this.ig             = ig;
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

  async editProfile({ username, name, bio, url, gender, phoneNumber, email, profilePic }) {
    const currentUser = await this.ig.account.currentUser();
    log(currentUser);

    if (!(username || name || bio || url || gender || phoneNumber || email)) {
      log.warn(`Nothing to edit`);
      return;
    }

    let options = {
      external_url: url || currentUser.external_url,
      gender: gender || currentUser.gender,
      phone_number: phoneNumber || currentUser.phone_number,
      username: username || currentUser.username,
      first_name: name || currentUser.full_name,
      biography: bio || currentUser.biography,
      email: email || currentUser.email,
    };
    log('Options:');
    log(options);

    log('Editing profile...');
    let result = await SessionManager.call(() => this.ig.account.editProfile(options) );
    log(result);

    if (profilePic) {
      log('Changing profile picture...');
      const readStream = fs.createReadStream(profilePic);
      result = await SessionManager.call(() => this.ig.account.changeProfilePicture(readStream) );
      log(result);
    }

    log('Done');
  }
}

module.exports = AccountManager;
