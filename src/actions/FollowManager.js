const { logHandler, quickSleep } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const { sample, map, isEmpty, filter, includes, some, values } = require('lodash');

const SessionManager = require('../SessionManager');


class FollowManager {
  constructor({ username, ig, sources, getBlacklist, addStats, addTarget, addAction }) {
    this.username = username;
    this.ig       = ig;
    this.sources  = sources;

    this.getBlacklist = getBlacklist;
    this.addStats     = addStats;
    this.addTarget    = addTarget;
    this.addAction    = addAction;
  }

  async scrape({ sourceUsername }) {
    log(`Scrapping ${sourceUsername}...`);

    const source = await SessionManager.call( () => this.ig.user.searchExact(sourceUsername) );
    const blacklist = await this.getBlacklist();

    log(`Fetching ${source.username}'s followers`);
    const followersFeed = this.ig.feed.accountFollowers(source.pk);

    let page = 0;
    while (true) {
      log(`Fetching page ${++page}`);
      const followers  = await SessionManager.call( () => followersFeed.items() );
      log(`Fetching friendship status for ${followers.length} users`);
      const friendship = await SessionManager.call( () => this.ig.friendship.showMany(map(followers, 'pk')) );

      if (isEmpty(followers)) {
        log(`Reached end of feed.`);
        break;
      }

      const validUsers = filter(followers, { 'is_private': false, 'is_verified': false, 'has_anonymous_profile_picture': false });
      log(`Fetched: ${followers.length} users (valid: ${validUsers.length})`);

      for (const follower of validUsers) {
        const followerPk = follower.pk;
        const followerUsername = follower.username;

        if (includes(blacklist, followerPk)) {
          continue;
        }

        log(`Checking ${followerUsername}...`);

        if (some(values(friendship[followerPk]))) {
          await this.addTarget({ followerUsername, pk: followerPk, followed: false, blacklisted: true });
          log(`Rejected (friendship status)`);
          continue;
        }

        const userInfo = await SessionManager.call( () => this.ig.user.info(followerPk) );
        if (userInfo.is_business) {
          await this.addTarget({ followerUsername, pk: followerPk, followed: false, blacklisted: true });
          log(`Rejected (business)`);
          continue;
        }

        await this.addTarget({ followerUsername, pk: followerPk, followed: false, blacklisted: false });
      }
    }

    log('Done');
  }

  async followRecommended() {
    log('Loading recommended users...');

    const feed = this.ig.feed.discover();
    const recommendations = await SessionManager.call( () => feed.items() );

    log(`Found ${recommendations.length} users:`);
    for (let recommended of recommendations) {
      log(recommended.user.username);
    }

    const user = sample(recommendations).user;
    log(`Following ${user.username}...`);

    await SessionManager.call( () => this.ig.friendship.create(user.pk) );
    await this.addAction({ type: 'followRecommended', reference: user.username });

    log('Done');
  }

  async follow() {
    const sourceUsername = sample(this.sources);
    log(`Source: ${sourceUsername}`);

    if (!sourceUsername) {
      log.warn(`No sources to follow.`);
      return;
    }

    const source = await SessionManager.call( () => this.ig.user.searchExact(sourceUsername) );
    const blacklist = await this.getBlacklist();

    log(`Fetching ${source.username}'s followers`);
    const followersFeed = this.ig.feed.accountFollowers(source.pk);

    let page = 0;
    let followed = false;
    while (true) {
      log(`Fetching page ${++page}`);
      const followers  = await SessionManager.call( () => followersFeed.items() );
      log(`Fetching friendship status for ${followers.length} users`);
      const friendship = await SessionManager.call( () => this.ig.friendship.showMany(map(followers, 'pk')) );

      if (isEmpty(followers)) {
        log(`Reached end of feed.`);
        break;
      }

      const validUsers = filter(followers, { 'is_private': false, 'is_verified': false, 'has_anonymous_profile_picture': false });
      log(`Fetched: ${followers.length} users (valid: ${validUsers.length})`);

      for (const follower of validUsers) {
        const followerPk = follower.pk;
        const followerUsername = follower.username;

        if (includes(blacklist, followerPk)) {
          continue;
        }

        log(`Checking ${followerUsername}...`);

        if (some(values(friendship[followerPk]))) {
          await this.addTarget({ followerUsername, pk: followerPk, followed: false, blacklisted: true });
          log(`Rejected (friendship status)`);
          continue;
        }

        const userInfo = await SessionManager.call( () => this.ig.user.info(followerPk) );
        if (userInfo.is_business) {
          await this.addTarget({ followerUsername, pk: followerPk, followed: false, blacklisted: true });
          log(`Rejected (business)`);
          continue;
        }

        log(`Following ${followerUsername}`);
        const response = await SessionManager.call( () => this.ig.friendship.create(followerPk) );
        log(response);

        await this.addTarget({ followerUsername, pk: followerPk, followed: true, blacklisted: false });
        await this.addAction({ type: 'followSource', reference: followerUsername });

        followed = true;
        break;
      }

      if (followed) break;
    }

    log('Done');
  }

  async run({ followLimit }) {
    log(`Going to follow ${followLimit} users`);

    const sourceUsername = sample(this.sources);
    log(`Source: ${sourceUsername}`);

    if (!sourceUsername) {
      log.warn(`No sources to follow.`);
      return;
    }

    const source = await SessionManager.call( () => this.ig.user.searchExact(sourceUsername) );

    const blacklist = await this.getBlacklist();

    log(`Fetching ${source.username}'s followers...`);
    const followersFeed = this.ig.feed.accountFollowers(source.pk);

    let followCount = 0;
    let page = 0;
    while (true) {
      page++;
      log(`Fetching page #${page}...`);
      const followers = await SessionManager.call( () => followersFeed.items() );
      const friendship = await SessionManager.call( () => this.ig.friendship.showMany(map(followers, 'pk')) );

      if (isEmpty(followers)) {
        log(`Reached end of feed.`);
        break;
      }

      const validUsers = filter(followers, { 'is_private': false, 'is_verified': false, 'has_anonymous_profile_picture': false });
      log(`Fetched: ${followers.length} users (valid: ${validUsers.length})`);

      for (const follower of validUsers) {
        const followerPk = follower.pk;
        const followerUsername = follower.username;

        if (includes(blacklist, followerPk)) {
          continue;
        }

        log(`Checking ${followerUsername}...`);

        if (some(values(friendship[followerPk]))) {
          await this.addTarget({ followerUsername, pk: followerPk, followed: false, blacklisted: true });
          log(`Rejected (friendship status)`);
          continue;
        }

        await quickSleep();

        const userInfo = await SessionManager.call( () => this.ig.user.info(followerPk) );
        if (userInfo.is_business) {
          await this.addTarget({ followerUsername, pk: followerPk, followed: false, blacklisted: true });
          log(`Rejected (business)`);
          continue;
        }

        log(`Following ${followerUsername}...`);

        await SessionManager.call( () => this.ig.friendship.create(followerPk) );

        await this.addTarget({ followerUsername, pk: followerPk, followed: true, blacklisted: false });
        await this.addStats({ type: 'follow', reference: followerUsername });

        followCount++;
        log(`Followed ${followerUsername} (${followCount}/${followLimit})`);

        if (followCount >= followLimit) {
          break;
        }
      }

      if (followCount >= followLimit) {
        break;
      }
    }

    log(`Followed ${followCount} users`);
  }
}

module.exports = FollowManager;
