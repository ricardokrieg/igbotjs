const { IgApiClient } = require('instagram-private-api');
const { logHandler } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);

const DBManager      = require('./DBManager');
const SessionManager = require('./SessionManager');
const AccountManager = require('./AccountManager');
const StatsManager   = require('./StatsManager');
const FollowManager  = require('./actions/FollowManager');


class Bot {
  constructor({ username }) {
    this.username = username;
    log(`Username: ${username}`);

    this.ig = new IgApiClient();

    this.dbManager = new DBManager({
      username,
      url: 'mongodb://wolf:xxx123xxx@ds243963.mlab.com:43963/igbotjs',
      dbName: 'igbotjs',
    });
  }

  async setup() {
    log(`Setup - Start`);

    await this.dbManager.connect();

    const accountDetails = await this.dbManager.accountDetails();

    this.sessionManager = new SessionManager({
      ig: this.ig,
      username: this.username,
      accountDetails,
      dbManager: this.dbManager,
    });

    this.accountManager = new AccountManager({
      ig: this.ig,
      username: this.username,
      accountDetails,
    });

    const statsCol = this.dbManager.statsCol();
    this.statsManager = new StatsManager({
      username: this.username,
      statsCol,
    });

    const sources = accountDetails.sources;
    this.followManager = new FollowManager({
      ig: this.ig,
      username: this.username,
      sources,
      getBlacklist: this.statsManager.getBlacklist.bind(this.statsManager),
      addStats: this.statsManager.addStats.bind(this.statsManager),
      addTarget: this.statsManager.addTarget.bind(this.statsManager),
    });

    this.sessionManager.start();
    this.accountManager.setup();

    await this.sessionManager.login();

    log(`Setup - End`);
  }

  async simulate() {
    log('Starting simulator...');

    await this.setup();

    const followLimit  = this.accountManager.getFollowLimit();
    const publishLimit = this.accountManager.getPublishLimit();
    const storiesLimit = this.accountManager.getStoriesLimit();
    const feedLimit    = this.accountManager.getFeedLimit();

    log(`Follow : ${followLimit}`);
    log(`Publish: ${publishLimit}`);
    log(`Stories: ${storiesLimit}`);
    log(`Feed   : ${feedLimit}`);

    const schedule = Scheduler.generate({
      followLimit,
      publishLimit,
      storiesLimit,
      feedLimit,
    });

    for (let event of schedule) {
      switch(event.action) {
        case 'follow':
          await this.followManager.run({ limit: event.limit });
          break;
        default:
          log.error(`"${event.action}" not implemented`);
          break;
      }
    }

    log('Simulator finished');
  }
}

module.exports = Bot;
