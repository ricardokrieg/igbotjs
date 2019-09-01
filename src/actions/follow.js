const { includes, filter, some, values, map, random } = require('lodash');

const { logger, sleep, call } = require('../utils');

const log = (message) => logger('Follow', message);


async function follow({ ig, targetsCol, follows }) {
  let followCount = 0;
  const followLimit = Math.round(random(follows - (follows * 0.5), follows + (follows * 0.5)));

  log(`Going to follow ${followLimit} users`);

  const targets = await targetsCol.find({ followed: false, blacklisted: false }).limit(followLimit).toArray();

  while (true) {
    if (followCount >= followLimit) {
      break;
    }

    for (const target of targets) {
      log(`User: ${target._id}`);

      await sleep(random(5000, 20000));

      const user = await call(() => { return ig.user.searchExact(target._id) });
      const userInfo = await call(() => { return ig.user.info(user.pk) });

      if (some(values(user.friendship_status))) {
        await targetsCol.updateOne({ _id: target._id }, { $set: { followed: true } });
        log(`Rejected (friendship status)`);
        continue;
      }

      if (userInfo.is_business) {
        await targetsCol.updateOne({ _id: target._id }, { $set: { blacklisted: true } });
        log(`Rejected (business)`);
        continue;
      }

      // TODO
      // if (user.latest_reel_media === 0) reject (no stories)

      log(`Following ${user.username}...`);

      await call(() => { return ig.friendship.create(user.pk) });
      await targetsCol.updateOne({ _id: target._id }, { $set: { followed: true } });

      followCount++;
      log(`Followed ${user.username}`);

      log(`Follows: ${followCount}/${followLimit}`);

      if (followCount >= followLimit) {
        break;
      }
    }
  }

  log(`Followed ${followCount} users`);
}

module.exports = { follow };

/*async function followOld({ sourceUsername, follows, blacklist }) {
  const source = await this.call((params) => { return this.ig.user.searchExact(params[0]) }, sourceUsername);
  this.log('Source:');
  this.log(source);

  this.log(`Fetching ${source.username}'s followers...`);
  const followersFeed = this.ig.feed.accountFollowers(source.pk);

  let page = 0;
  let followCount = 0;
  const followLimit = Math.round(random(follows - (follows * 0.5), follows + (follows * 0.5)));

  this.log(`Going to follow ${followLimit} users`);

  while (true) {
    page++;

    if (followCount >= followLimit) {
      break;
    }

    this.log(`Page #${page}`);

    const items = await this.call((params) => { return params[0].items() }, followersFeed);

    const validUsers = filter(items, { 'is_private': false, 'is_verified': false, 'has_anonymous_profile_picture': false });
    this.log(`Fetched: ${items.length} users (valid: ${validUsers.length})`);

    const friendship = await this.call((params) => { return this.ig.friendship.showMany(map(params[0], 'pk')) }, validUsers);

    for (const user of validUsers) {
      if (includes(blacklist, user.username)) {
        continue;
      }

      this.log(`User: ${user.username}`);

      if (some(values(friendship[user.pk]))) {
        await this.addFollowerBlacklist(user.username);
        this.log(`Rejected (friendship status)`);
        continue;
      }

      await this.sleep(random(5000, 20000));

      const userInfo = await this.call((params) => { return this.ig.user.info(params[0].pk) }, user);
      if (userInfo.is_business) {
        await this.addFollowerBlacklist(user.username);
        this.log(`Rejected (business)`);
        continue;
      }

      this.log(`Following ${user.username}...`);
      this.log(userInfo);

      await this.call((params) => { return this.ig.friendship.create(params[0].pk) }, user);
      followCount++;
      this.log(`Followed ${user.username}`);

      this.log(`Follows: ${followCount}/${followLimit}`);

      if (followCount >= followLimit) {
        break;
      }
    }
  }

  this.log(`Followed ${followCount} users`);
}*/

/*async followers() {
  await this.setup();

  this.log('Followers Start');

  const followersFeed = this.ig.feed.accountFollowers();

  const followers = await this.call((params) => { return params[0].items(); }, followersFeed);
  this.log(`Followers: ${map(followers, 'username')}`);

  this.log('Followers End');
}*/
