const { longSleep } = require('../../v2/utils/sleep');
const { inputUsername } = require('../../v2/utils/username');
const Bot = require('../../Bot');
const addBlacklist = require('../../v2/firestore/addBlacklist');
const addFollower = require('../../v2/firestore/addFollower');
const debug = require('debug')('bot:brabosburguer:updateStats');

(async () => {
  debug('Start');

  const username = 'teresina582';
  // const username = process.env.IG_USERNAME || await inputUsername();

  const bot = new Bot({ username });
  await bot.setup();

  await bot.sessionManager.login();
  await longSleep();

  const followerCallback = async (follower) => {
    debug(follower.username);

    try {
      await addBlacklist({ username: follower.username, pk: follower.pk });
      await addFollower({ username: follower.username, pk: follower.pk });
    } catch (e) {
      log.error(`Error: ${e.message}`);
    }
  }

  const followingCallback = async (follwoing) => {
    debug(follwoing.username);

    try {
      await addBlacklist({ username: follwoing.username, pk: follwoing.pk });
    } catch (e) {
      log.error(e.message);
    }
  }

  await bot.followManager.extractFollowers({ sourceUsername: 'brabosburguerthe', callback: followerCallback });
  await bot.followManager.extractFollowing({ sourceUsername: 'brabosburguerthe', callback: followingCallback });

  process.exit(0);
})();
