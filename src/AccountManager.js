const { logHandler } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);

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
}

module.exports = AccountManager;
