const { includes, filter, some, values, map, random, sample, isEmpty } = require('lodash');

const { logger, quickSleep, call, randomLimit } = require('../utils');

const log = (message) => logger('Follow', message);


async function follow({ ig, accountDetails, targetsCol }) {
  const followLimit = randomLimit(accountDetails.followLimit / accountDetails.activeHours);
  log(`Going to follow ${followLimit} users`);

  const sourceUsername = sample(accountDetails.sources);

  const source = await call(() => { return ig.user.searchExact(sourceUsername) }, );
  log('Source:');
  log(source);

  const blacklist = map(await targetsCol.find().toArray(), 'pk');

  log(`Fetching ${source.username}'s followers...`);
  const followersFeed = ig.feed.accountFollowers(source.pk);

  let followCount = 0;
  let page = 0;
  while (true) {
    page++;
    log(`Fetching page #${page}...`);
    const followers = await call(() => { return followersFeed.items(); });
    const friendship = await call(() => { return ig.friendship.showMany(map(followers, 'pk')) });

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

      log(`User: ${followerUsername}`);

      if (some(values(friendship[followerPk]))) {
        await targetsCol.insertOne({ _id: followerUsername, pk: followerPk, followed: false, blacklisted: true, account: accountDetails._id });
        log(`Rejected (friendship status)`);
        continue;
      }

      await quickSleep();

      const userInfo = await call(() => { return ig.user.info(followerPk) });
      if (userInfo.is_business) {
        await targetsCol.insertOne({ _id: followerUsername, pk: followerPk, followed: false, blacklisted: true, account: accountDetails._id });
        log(`Rejected (business)`);
        continue;
      }

      log(`Following ${followerUsername}...`);
      log(userInfo);

      await call(() => { return ig.friendship.create(followerPk) });
      await targetsCol.insertOne({ _id: followerUsername, pk: followerPk, followed: true, blacklisted: false, account: accountDetails._id });

      followCount++;
      log(`Followed ${followerUsername}`);
      log(`Follows: ${followCount}/${followLimit}`);

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

async function followFromList({ ig, targetsCol, follows }) {
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
