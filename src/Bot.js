const { IgApiClient } = require('instagram-private-api');
const { random, omit, isEmpty, times, constant, shuffle, sample, forEach } = require('lodash');
const moment = require('moment');
const { logHandler, longSleep, sleep24h } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);

const DBManager      = require('./DBManager');
const SessionManager = require('./SessionManager');
const AccountManager = require('./AccountManager');
const StatsManager   = require('./StatsManager');
const FollowManager  = require('./actions/FollowManager');
const StoriesManager = require('./actions/StoriesManager');
const FeedManager    = require('./actions/FeedManager');
const PublishManager = require('./actions/PublishManager');
const ExploreManager = require('./actions/ExploreManager');
const Scheduler      = require('./Scheduler');


class Bot {
  constructor({ username, sandbox }) {
    this.sandbox = sandbox;
    if (sandbox) {
      log.warn('Running on sandbox mode');
    }

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
    log('Account Details:');
    log(omit(accountDetails, ['cookies']));

    this.sessionManager = new SessionManager({
      ig: this.ig,
      username: this.username,
      accountDetails,
      dbManager: this.dbManager,
    });

    const runsCol    = this.dbManager.runsCol();
    const actionsCol = this.dbManager.actionsCol();
    const statsCol   = this.dbManager.statsCol();
    const targetsCol = this.dbManager.targetsCol();
    const uploadsCol = this.dbManager.uploadsCol();
    this.statsManager = new StatsManager({
      username: this.username,
      runsCol,
      statsCol,
      actionsCol,
      targetsCol,
      uploadsCol,
    });

    this.accountManager = new AccountManager({
      ig: this.ig,
      username: this.username,
      accountDetails,
      getActionsBetween: this.statsManager.getActionsBetween.bind(this.statsManager),
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

    this.exploreManager = new ExploreManager({
      ig: this.ig,
      username: this.username,
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
    const lastRun = await this.statsManager.getLastRun();
    log(`Last Run: ${lastRun}`);

    const totalActions = await this.accountManager.getTotalActions();
    const actionsForToday = totalActions > 0 ? totalActions : 1;

    log(`Total Actions: ${totalActions}, Actions for today: ${actionsForToday}`);

    let weights = {
      followSource: 10,
      // followRecommended: 1,
      // followExplore: 1,
      // likeFeedLast: 2,
      // likeFeedOld: 1,
      likeExplore: 4,
    };

    if (actionsForToday < 10) {
      weights = {
        ...weights,
        followSource: 0,
      };
    }

    // first run of the day
    let dayOff = false;
    if (!moment().isSame(lastRun, 'day')) {
      log('Starting daily routine');

      // decide if day off
      if (actionsForToday > 100 && random(0, 100) < 10) {
        log('Day Off');
        await sleep24h();

        dayOff = true;
      }
    }

    if (dayOff) {
      log('Day Off. Exiting.');
      return;
    }

    const actions = this.generateActions({ totalActions: actionsForToday, weights });
    log('Actions');
    log(actions);

    if (isEmpty(actions)) {
      log('No Actions');
      return;
    }

    await this.statsManager.addRun({ actions: actionsForToday });

    process.exit(0);
    await this.sessionManager.login();

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
  }

  generateActions({ totalActions, weights }) {
    let actions = [];
    const lightActionTypes = [
      // 'openPostComments',
      // 'scrollExplore',
      // 'openProfile',
      'search',
    ];
    let hardActionTypes = [];
    forEach(weights, function(weight, actionType) {
      hardActionTypes = [
          ...hardActionTypes,
          ...times(weight, constant(actionType)),
      ];
    });

    times(totalActions, () => {
      actions = [ ...actions, sample(hardActionTypes) ];
    });
    times(Math.round(totalActions / 3), () => {
      actions = [ ...actions, sample(lightActionTypes) ];
    });
    actions = shuffle(actions);

    return actions;
  }
}

module.exports = Bot;
