const { logHandler } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const { sample, isEmpty } = require('lodash');

const SessionManager = require('../SessionManager');

class SearchManager {
  constructor({ username, ig }) {
    this.username = username;
    this.ig       = ig;
  }

  async search(query = this.randomQuery()) {
    log(`Searching "${query}"...`);

    const result = await SessionManager.call( () => this.ig.user.search(query) );
    const users = result['users'];
    log(`Found ${users.length} results.`);

    if (!isEmpty(users)) {
      const user = sample(users);

      log(`Visiting ${user['username']} profile...`);
      const info = await SessionManager.call( () => this.ig.user.info(user['pk']) );
    }
  }

  randomQuery(n = 5) {
    let result             = '';
    const characters       = 'abcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;

    for (let i = 0; i < n; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }
}

module.exports = SearchManager;