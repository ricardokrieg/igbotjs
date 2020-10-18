const { logHandler, longSleep, inputUsername } = require('../../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('../../Bot');
const SessionManager = require('../../SessionManager');

const PROJECT = process.env.PROJECT;

(async () => {
  log('Start');

  const username = process.env.IG_USERNAME || await inputUsername();

  const bot = new Bot({ username });
  await bot.setup();

  await bot.sessionManager.login();
  await longSleep();

  const followerCallback = async (follower) => {
    log(follower.username);

    try {
      await bot.statsManager.addToBlacklist({ username: follower.username, params: { pk: follower.pk, project: 'brabosburguer' } });
      await bot.statsManager.addToFollowers({ username: follower.username, params: { pk: follower.pk, project: 'brabosburguer' } });
    } catch (e) {
      log.error(`Error: ${e.message}`);
    }
  }

  const followingCallback = async (follwoing) => {
    log(follwoing.username);

    try {
      await bot.statsManager.addToBlacklist({ username: follwoing.username, params: { pk: follwoing.pk, project: 'brabosburguer' } });
    } catch (e) {
      log.error(e.message);
    }
  }

  await bot.followManager.extractFollowers({ sourceUsername: 'brabosburguerthe', callback: followerCallback });
  await bot.followManager.extractFollowing({ sourceUsername: 'brabosburguerthe', callback: followingCallback });

  process.exit(0);
})();
