const { logHandler, quickSleep } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const { sample, map, isEmpty, filter, includes, some, values } = require('lodash');

const SessionManager = require('../SessionManager');


class FollowManager {
  constructor({ username, ig, sources, getBlacklist, addStats, addTarget }) {
    this.username = username;
    this.ig       = ig;
    this.sources  = sources;

    this.getBlacklist = getBlacklist;
    this.addStats     = addStats;
    this.addTarget    = addTarget;
  }

  async run({ followLimit }) {
    log(`Going to follow ${followLimit} users`);

    const sourceUsername = sample(this.sources);
    log(`Source: ${sourceUsername}`);

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
