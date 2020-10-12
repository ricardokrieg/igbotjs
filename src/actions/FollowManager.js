const { logHandler, quickSleep } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const { sample, map, isEmpty, filter, includes, some, values } = require('lodash');

const SessionManager = require('../SessionManager');


class FollowManager {
  constructor({ username, ig, sources, getBlacklist, addStats, addTarget, addAction, targetsCol }) {
    this.username = username;
    this.ig       = ig;
    this.sources  = sources;

    this.getBlacklist = getBlacklist;
    this.addStats     = addStats;
    this.addTarget    = addTarget;
    this.addAction    = addAction;

    this.targetsCol = targetsCol;
  }

  async scrape({ sourceUsername }) {
    log(`Scrapping ${sourceUsername}...`);

    const source = await SessionManager.call( () => this.ig.user.searchExact(sourceUsername) );
    const blacklist = await this.getBlacklist();

    log(`Blacklist has ${blacklist.length} accounts`);

    log(`Fetching ${source.username}'s followers`);
    const followersFeed = this.ig.feed.accountFollowers(source.pk);

    let page = 0;
    let total = 0;
    let valid = 0;
    while (true) {
      log(`Fetching page ${++page}`);
      const followers  = await SessionManager.call( () => followersFeed.items() );

      if (isEmpty(followers)) {
        log(`Reached end of feed.`);
        break;
      }

      // const validUsers = filter(followers, { 'is_private': false, 'is_verified': false, 'has_anonymous_profile_picture': false });
      log(`Fetched: ${followers.length} followers`);

      total += followers.length;
      for (const follower of followers) {
        const followerPk = follower.pk;
        const followerUsername = follower.username;

        if (includes(blacklist, followerPk) || includes(blacklist, followerUsername)) {
          continue;
        }

        // if (follower.is_private || follower.is_verified || follower.has_anonymous_profile_picture) {
        if (follower.is_verified || follower.has_anonymous_profile_picture) {
          continue;
        }

        if (!follower.is_private && follower.latest_reel_media === 0) {
          continue;
        }

        log(`Checking ${followerUsername}...`);

        const userInfo = await SessionManager.call( () => this.ig.user.info(followerPk) );

        if (userInfo.is_business) {
          await this.addTarget({
            followerUsername, pk: followerPk, source: sourceUsername, sourceType: 'account',
            followed: false, blacklisted: true
          });
          log(`Rejected (business)`);
          continue;
        }

        if (userInfo.media_count < 9) {
          await this.addTarget({
            followerUsername, pk: followerPk, source: sourceUsername, sourceType: 'account',
            followed: false, blacklisted: true
          });
          log(`Rejected (media_count)`);
          continue;
        }

        if (userInfo.follower_count < 100 || userInfo.follower_count > 5000) {
          await this.addTarget({
            followerUsername, pk: followerPk, source: sourceUsername, sourceType: 'account',
            followed: false, blacklisted: true
          });
          log(`Rejected (follower_count)`);
          continue;
        }

        if (userInfo.following_count < 100 || userInfo.following_count > 5000) {
          await this.addTarget({
            followerUsername, pk: followerPk, source: sourceUsername, sourceType: 'account',
            followed: false, blacklisted: true
          });
          log(`Rejected (following_count)`);
          continue;
        }

        if (isEmpty(userInfo.biography)) {
          await this.addTarget({
            followerUsername, pk: followerPk, source: sourceUsername, sourceType: 'account',
            followed: false, blacklisted: true
          });

          log(`Rejected (biography)`);
          continue;
        }

        let invalidBiography = false;
        for (let word of ['whatsapp', 'zap', 'link', 'direct', 'parceria', 'curso', 'peça', 'pedido', 'comercial', 'acesse', 'ifood']) {
          if (userInfo.biography.includes(word)) {
            await this.addTarget({
              followerUsername, pk: followerPk, source: sourceUsername, sourceType: 'account',
              followed: false, blacklisted: true
            });

            log(`Rejected (biography)`);
            invalidBiography = true;
            break;
          }
        }
        if (invalidBiography) {
          continue;
        }

        if (!isEmpty(userInfo.external_url)) {
          await this.addTarget({
            followerUsername, pk: followerPk, source: sourceUsername, sourceType: 'account',
            followed: false, blacklisted: true
          });
          log(`Rejected (external_url)`);
          continue;
        }

        valid += 1;
        log(`Adding...`);
        await this.addTarget({
          followerUsername, pk: followerPk, source: sourceUsername, sourceType: 'account',
          followed: false, blacklisted: false, brabosburguer: true });
      }

      log(`Page: ${page}`);
      log(`Total: ${total}`);
      log(`Added: ${valid}`);
      log(`Successfully Added: ${((valid / total) * 100).toFixed(2)}%`);
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
          await this.addTarget({
            followerUsername, pk: followerPk, source: sourceUsername, sourceType: 'account',
            followed: false, blacklisted: true
          });
          log(`Rejected (friendship status)`);
          continue;
        }

        const userInfo = await SessionManager.call( () => this.ig.user.info(followerPk) );
        if (userInfo.is_business) {
          await this.addTarget({
            followerUsername, pk: followerPk, source: sourceUsername, sourceType: 'account',
            followed: false, blacklisted: true
          });
          log(`Rejected (business)`);
          continue;
        }

        log(`Following ${followerUsername}`);
        const response = await SessionManager.call( () => this.ig.friendship.create(followerPk) );
        log(response);

        await this.addTarget({
          followerUsername, pk: followerPk, source: sourceUsername, sourceType: 'account',
          followed: true, blacklisted: false
        });
        await this.addAction({ type: 'followSource', reference: followerUsername });

        followed = true;
        break;
      }

      if (followed) break;
    }

    log('Done');
  }

  async followTargets({ limit }) {
    const querySnapshot = await this.targetsCol.where('blacklisted', '==', false)
                                               .where('followed', '==', false)
                                               .get();
    let users = [];
    querySnapshot.forEach((snapshot) => {
      users.push({ docRef: snapshot.ref, username: snapshot.ref.id, ...snapshot.data() });
    });

    // TODO should set a limit here
    log(`Fetching friendship status for ${users.length} users`);
    const friendship = await SessionManager.call( () => this.ig.friendship.showMany(map(users, 'pk')));

    let i = 0;
    let total = 0;
    for (const user of users) {
      const docRef = user.docRef;
      const username = user.username;
      const followerPk = user.pk;

      log(`Checking ${username}...`);

      if (some(values(friendship[followerPk]))) {
        await docRef.set({ blacklisted: true }, { merge: true });
        log(`Rejected (friendship status)`);
        continue;
      }

      log(`Following ${username}`);
      const response = await SessionManager.call( () => this.ig.friendship.create(followerPk) );
      await docRef.set({ followed: true }, { merge: true });
      total += 1;
      log(response);

      log(`Followed ${total} of ${limit}`);
      if (total >= limit) {
        log(`Reached limit. Stop following.`);
        break;
      }

      i += 1;
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
          await this.addTarget({
            followerUsername, pk: followerPk, source: sourceUsername, sourceType: 'account',
            followed: false, blacklisted: true
          });
          log(`Rejected (friendship status)`);
          continue;
        }

        await quickSleep();

        const userInfo = await SessionManager.call( () => this.ig.user.info(followerPk) );
        if (userInfo.is_business) {
          await this.addTarget({
            followerUsername, pk: followerPk, source: sourceUsername, sourceType: 'account',
            followed: false, blacklisted: true
          });
          log(`Rejected (business)`);
          continue;
        }

        log(`Following ${followerUsername}...`);

        await SessionManager.call( () => this.ig.friendship.create(followerPk) );

        await this.addTarget({
          followerUsername, pk: followerPk, source: sourceUsername, sourceType: 'account',
          followed: true, blacklisted: false
        });
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
