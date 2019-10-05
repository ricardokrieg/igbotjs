const { isUndefined } = require('lodash');
const { logHandler } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const fs = require('fs');
const SessionManager = require('./SessionManager');
const PublishManager = require('./actions/PublishManager');


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
      let result = await SessionManager.call(() => this.ig.account.editProfile(options) );
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
      result = await SessionManager.call(() => this.ig.account.changeProfilePicture(readStream) );
      log(result);
    }

    log('Done');
  }
}

module.exports = AccountManager;
