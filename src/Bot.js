const { IgApiClient } = require('instagram-private-api');
const { isNumber, random, omit, pick, isEmpty, times, constant, shuffle, sample, forEach } = require('lodash');
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
const SearchManager  = require('./actions/SearchManager');
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
      dbManager: this.dbManager,
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
      addAction: this.statsManager.addAction.bind(this.statsManager),
    });

    this.storiesManager = new StoriesManager({
      ig: this.ig,
      username: this.username,
    });

    this.feedManager = new FeedManager({
      ig: this.ig,
      username: this.username,
      addStats: this.statsManager.addStats.bind(this.statsManager),
      addAction: this.statsManager.addAction.bind(this.statsManager),
    });

    this.publishManager = new PublishManager({
      ig: this.ig,
      username: this.username,
      imagesPath: accountDetails.path,
      getBlacklist: this.statsManager.getPublishBlacklist.bind(this.statsManager),
      addUpload: this.statsManager.addUpload.bind(this.statsManager),
      addStats: this.statsManager.addStats.bind(this.statsManager),
      addAction: this.statsManager.addAction.bind(this.statsManager),
    });

    this.exploreManager = new ExploreManager({
      ig: this.ig,
      username: this.username,
      addAction: this.statsManager.addAction.bind(this.statsManager),
    });

    this.searchManager = new SearchManager({
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
    log(`Last Run: ${lastRun ? lastRun : 'Never'}`);

    const totalActions = await this.accountManager.getTotalActions();
    const actionsForToday = totalActions > 0 ? totalActions : 1;

    log(`Total Actions: ${totalActions}, Actions for today: ${actionsForToday}`);

    let weights = {
      followSource: actionsForToday > 10 ? 10 : 0,
      followRecommended: 1,
      followExplore: 1,
      likeFeed: 2,
      likeFeedOld: 1,
      likeExplore: 4,
    };

    if (lastRun && moment().isSame(lastRun, 'day')) {
      log.warn(`This account already ran today (lastRun: ${lastRun})`);
      return;
    } else {
      log('Starting daily routine');

      // decide if day off
      if (actionsForToday > 100 && random(0, 100) < 10) {
        log('Day Off');
        return;
      }
    }

    const publishedToday = await this.statsManager.getPublishedToday();
    const { publishMin, publishMax } = await this.accountManager.getPublishValues();
    const shouldPublish = !publishedToday && actionsForToday > 10 && isNumber(publishMin) && isNumber(publishMax);

    const publishCount = shouldPublish ? random(publishMin, publishMax) : 0;

    const actions = this.generateActions({ totalActions: actionsForToday, weights, publishCount });
    log('Actions');
    log(actions);

    if (isEmpty(actions)) {
      log('No Actions');
      return;
    }

    await this.sessionManager.login();

    log('User Info:');
    const currentUser = await SessionManager.call( () => this.ig.account.currentUser() );
    const userInfo = await SessionManager.call( () => this.ig.user.info(currentUser.pk) );
    log(pick(userInfo, ['pk', 'username', 'full_name', 'profile_pic_url', 'media_count', 'follower_count', 'following_count', 'biography', 'external_url']));

    const actionsCount = actions.length;
    let currentAction = 0;
    for (let action of actions) {
      log(`Action: ${action} (${++currentAction} of ${actionsCount})`);

      switch (action) {
        case 'followRecommended':
          await this.followManager.followRecommended();
          break;
        case 'likeFeed':
          await this.feedManager.like();
          break;
        case 'likeFeedOld':
          await this.feedManager.likeOld();
          break;
        case 'likeExplore':
          await this.exploreManager.like();
          break;
        case 'followExplore':
          await this.exploreManager.follow();
          break;
        case 'followSource':
          await this.followManager.follow();
          break;

        case 'scrollExplore':
          await this.exploreManager.scroll();
          break;
        case 'scrollFeed':
          await this.feedManager.scroll();
          break;
        case 'feedOpenProfile':
          await this.feedManager.openProfile();
          break;
        case 'feedOpenComments':
          await this.feedManager.openComments();
          break;
        case 'search':
          await this.searchManager.search();
          break;

        case 'publish':
          await this.publishManager.publish();
          break;

        default:
          log.warn(`Unknown Action: ${action}`);
          break;
      }
    }

    await this.statsManager.addRun({ actions: currentAction });
  }

  generateActions({ totalActions, weights, publishCount }) {
    let actions = [];
    const lightActionTypes = [
      'scrollExplore',
      'scrollFeed',
      'feedOpenProfile',
      'feedOpenComments',
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

    if (publishCount > 0) {
      log(`Going to publish ${publishCount} posts`);

      actions = [
        ...actions,
        ...times(publishCount, constant('publish')),
      ];
    }

    return shuffle(actions);
  }
}

module.exports = Bot;
