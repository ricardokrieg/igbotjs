const { IgApiClient } = require('instagram-private-api');
const { random } = require('lodash');
const { logHandler, longSleep } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);

const DBManager      = require('./DBManager');
const SessionManager = require('./SessionManager');
const AccountManager = require('./AccountManager');
const StatsManager   = require('./StatsManager');
const FollowManager  = require('./actions/FollowManager');
const StoriesManager = require('./actions/StoriesManager');
const FeedManager    = require('./actions/FeedManager');
const PublishManager = require('./actions/PublishManager');
const Scheduler      = require('./Scheduler');


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
      readAccountStartedAt: this.dbManager.readAccountStartedAt.bind(this.dbManager),
      readAccountLastRun: this.dbManager.readAccountLastRun.bind(this.dbManager),
      updateAccountDetails: this.dbManager.updateAccountDetails.bind(this.dbManager),
    });

    const statsCol   = this.dbManager.statsCol();
    const targetsCol = this.dbManager.targetsCol();
    const uploadsCol = this.dbManager.uploadsCol();
    this.statsManager = new StatsManager({
      username: this.username,
      statsCol,
      targetsCol,
      uploadsCol,
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

    this.storiesManager = new StoriesManager({
      ig: this.ig,
      username: this.username,
    });

    this.feedManager = new FeedManager({
      ig: this.ig,
      username: this.username,
      addStats: this.statsManager.addStats.bind(this.statsManager),
    });

    this.publishManager = new PublishManager({
      ig: this.ig,
      username: this.username,
      imagesPath: accountDetails.path,
      getBlacklist: this.statsManager.getPublishBlacklist.bind(this.statsManager),
      addUpload: this.statsManager.addUpload.bind(this.statsManager),
      addStats: this.statsManager.addStats.bind(this.statsManager),
    });

    this.sessionManager.start();
    this.accountManager.setup();

    log(`Setup - End`);
  }

  async simulate() {
    log('Starting simulator...');

    await this.sessionManager.login();

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
      log(`Schedule Event: ${JSON.stringify(event)}`);
      await longSleep();

      switch(event.action) {
        case 'follow':
          await this.followManager.run({ followLimit: event.limit });
          break;
        case 'stories':
          await this.storiesManager.run({ storiesLimit: event.limit });
          break;
        case 'feed':
          await this.feedManager.run({ feedLimit: event.limit });
          break;
        case 'publish':
          await this.publishManager.run();
          break;
        default:
          log.warn(`"${event.action}" not implemented`);
          break;
      }
    }

    log('Simulator finished');
  }

  async warmup() {
    // the actions the account will perform are based on the age
    // 0 - 7 days -> warmup phase. each day adds more types of actions
    // 8 - INF -> botting phase. each day increase the limits
    const age = await this.accountManager.getAccountAge();
    const newLastRun = moment();
    const lastRun = await this.accountManager.lastRun({ newLastRun });

    // TODO, session breaks
    // TODO, action breaks

    // first run of the week
    if (!newLastRun.isSame(lastRun, 'week')) {
      const {
        dailyLimitFactorLow,
        dailyLimitFactorHigh,
        dailyLimitDividerLow,
        dailyLimitDividerHigh,
        sleepTimeLow,
        sleepTimeHigh,
      } = this.accountManager.getAccountDetails();

      // 10% ~ 25%
      const dailyLimitFactor = random(dailyLimitFactorLow, dailyLimitFactorHigh);
      // 4 ~ 10
      const dailyLimitDivider = random(dailyLimitDividerLow, dailyLimitDividerHigh);
      // 20h ~ 00h
      const sleepTime = random(sleepTimeLow, sleepTimeHigh);

      this.accountManager.updateAccountDetails({
        dailyLimitFactor,
        dailyLimitDivider,
        sleepTime,
      });
    }

    // first run of the day
    if (!newLastRun.isSame(lastRun, 'day')) {
      // decide if day off
      if (random(0, 100) < 10) {
        // TODO, day off
        // sleep
        return;
      }

      const {
        dailyLimitFactor,
      } = this.accountManager.getAccountDetails();

      const expectedDailyLimit = {
        0: 0,
        1: 0,
        2: 1,
        3: 5,
        4: 10,
        5: 20,
        6: 50,
        7: 100,
      }[age] || 200;

      const dailyLimit = random(
        expectedDailyLimit * (100 - dailyLimitFactor)/100,
        expectedDailyLimit * (100 + dailyLimitFactor)/100
      );

      this.accountManager.updateAccountDetails({
        dailyLimit,
      });
    }

    switch(age) {
      case 0:
        // section delays: min: 60, max: 120
        // visit explore
          // load details from explore posts. min: 10, max: 30 (daily); min: 0, max: 5 (section)
          // load details from explore accounts. 10% of loaded posts
        // follow recommended. min: 3, max: 7 (daily); min: 0, max: 1 (section)
          // load account details before following
        // like feed posts. min: 3, max: 7 (daily); min: 0, max: 1 (section)
        // watch stories. min: 10, max: 30 (daily); min: 0, max: 5 (section)
          // (don`t necessarily watch all stories from an user. skip before finishing)
          // (don`t simply randomize them ...)
      default:
        log.warn(`Invalid WarmUp Phase: ${age}`);
        break;
    }
  }
}

module.exports = Bot;
