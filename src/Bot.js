const { IgApiClient } = require('instagram-private-api');
const {
  sampleSize,
  sample,
  includes,
  filter,
  some,
  values,
  map,
  random,
  times,
  without,
  isEmpty,
} = require('lodash');
const moment = require('moment');
const Spinner = require('node-spintax');
const fs = require('fs');
const { logHandler } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);

const { call, logger, greetingMessage, quickSleep, longSleep, stats } = require('./utils');
const { feed } = require('./actions/feed');
const { dmFollowers, inbox, sendMessage } = require('./actions/direct');
const { follow, getFollowLimit } = require('./actions/follow');
const { publish, getPublishLimit } = require('./actions/publish');
const { stories, getStoriesLimit } = require('./actions/stories');
const { comment, getFeedLimit } = require('./actions/comment');


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

    this.sessionManager = new SessionManager({
      ig: this.ig,
      username,
      dbManager: this.dbManager,
    });

    const accountDetails = this.dbManager.accountDetails();
    this.accountManager = new AccountManager({
      ig: this.ig,
      username,
      accountDetails,
    });

    const statsCol = this.dbManager.statsCol();
    this.statsManager = new StatsManager({ username, statsCol });

    const sources = accountDetails.sources;
    this.followManager = new FollowManager({
      ig: this.ig,
      username,
      sources,
      getBlacklist: this.statsManager.getBlacklist.bind(this.statsManager),
      addStats: this.statsManager.addStats.bind(this.statsManager),
      addTarget: this.statsManager.addTarget.bind(this.statsManager),
    });
  }

  async setup() {
    await this.dbManager.connect();

    this.sessionManager.start();
    this.accountManager.setup();

    await this.sessionManager.login();
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
      }
    }

    log('Simulator finished');
  }
}

module.exports = Bot;
