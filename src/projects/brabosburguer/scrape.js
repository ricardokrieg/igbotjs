const Bot = require('../../Bot');
const scrape = require('../../v2/actions/scrapeByUsername');
const { inputUsername } = require('../../v2/utils/username');
const getBlacklist = require('../../v2/firestore/getBlacklist');
const addBlacklist = require('../../v2/firestore/addBlacklist');
const addTarget = require('../../v2/firestore/addTarget');
const getTargets = require('../../v2/firestore/getTargets');
const debug = require('debug')('bot:brabosburguer:scrape');

const sourceUsername = process.env.IG_SOURCE;

(async () => {
  const username = process.env.IG_USERNAME || await inputUsername();
  debug(username);

  const bot = new Bot({ username });
  await bot.setup();

  await bot.sessionManager.login();

  const blacklist = await getBlacklist();
  debug(`Blacklist has ${blacklist.length} accounts`);

  const targets = await getTargets({ usernameOnly: true });
  debug(`Target list has ${targets.length} accounts`);

  const isBlacklisted = (targetUsername) => {
    return blacklist.includes(targetUsername) || targets.includes(targetUsername);
  };

  const addBlacklistProxy = async ({ followerUsername, followerPk }) => {
    await addBlacklist({ username: followerUsername, pk: followerPk, source: sourceUsername, sourceType: 'account' });
  };

  const addTargetProxy = async ({ followerUsername, followerPk }) => {
    await addTarget({ username: followerUsername, pk: followerPk, source: sourceUsername, sourceType: 'account' });
  };

  await scrape({ ig: bot.ig, sourceUsername, isBlacklisted, addBlacklist: addBlacklistProxy, addTarget: addTargetProxy });

  process.exit(0);
})();
