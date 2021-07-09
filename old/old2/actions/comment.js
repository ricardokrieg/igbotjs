const { includes, filter, some, values, map, random, sample, isEmpty } = require('lodash');
const Spinner = require('node-spintax');

const { stats, logger, quickSleep, call, randomLimit } = require('../utils');

const log = (message) => logger('Comment', message);


async function comment({ ig, accountDetails, targetsCol, statsCol }) {
  log('Start');

  if (accountDetails.disableComment) {
    log(`Comment is disabled for this account`);
    return;
  }

  const spinner = new Spinner(accountDetails.comment);
  log(`Spinner total variations: ${spinner.countVariations()}`);

  const commentLimit = randomLimit(accountDetails.commentLimit / accountDetails.activeHours);
  log(`Going to comment on ${commentLimit} posts`);

  const sourceUsername = sample(accountDetails.sources);

  const source = await call(() => { return ig.user.searchExact(sourceUsername) }, );
  log('Source:');
  log(source);

  const blacklist = map(await targetsCol.find().toArray(), 'pk');

  log(`Fetching ${source.username}'s followers...`);
  const followersFeed = ig.feed.accountFollowers(source.pk);

  let commentCount = 0;
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

      log(`Commenting on ${followerUsername}'s post...`);
      log(userInfo);

      const userFeed = ig.feed.user(followerPk);
      const items = await userFeed.items();

      if (isEmpty(items)) {
        await targetsCol.insertOne({ _id: followerUsername, pk: followerPk, followed: false, blacklisted: true, account: accountDetails._id });
        log(`Rejected (no posts)`);
        continue;
      }

      const text = spinner.unspinRandom(1)[0];
      log(`Commenting: ${text}`);

      const result = await call(() => {
        return ig.media.comment({
          mediaId: sample(items).id,
          text: text,
        });
      });

      await targetsCol.insertOne({ _id: followerUsername, pk: followerPk, followed: true, blacklisted: false, account: accountDetails._id });
      await stats(statsCol, accountDetails._id, 'comment', followerUsername);

      commentCount++;
      log(`Commented on ${followerUsername}'s post`);
      log(`Comments: ${commentCount}/${commentLimit}`);

      if (commentCount >= commentLimit) {
        break;
      }
    }

    if (commentCount >= commentLimit) {
      break;
    }
  }

  log(`Commented on ${commentCount} posts`);
}

module.exports = { comment };
