const Bot = require('../../Bot');
const scrape = require('../../v2/actions/scrapeByUsernameWithoutFilters');
const { inputUsername } = require('../../v2/utils/username');
const getBlacklist = require('../../v2/firestore/getBlacklist');
const addBlacklist = require('../../v2/firestore/addBlacklist');
const addTarget = require('../../v2/firestore/addTarget');
const addPotentialTarget = require('../../v2/firestore/addPotentialTarget');
const getTargets = require('../../v2/firestore/getTargets');
const getPotentialTargets = require('../../v2/firestore/getPotentialTargets');
const debug = require('debug')('bot:namoradasfofos:scrape');

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

  const potentialTargets = await getPotentialTargets({ usernameOnly: true });
  debug(`Potential Target list has ${potentialTargets.length} accounts`);

  const isBlacklisted = (targetUsername) => {
    return blacklist.includes(targetUsername) || targets.includes(targetUsername) || potentialTargets.includes(targetUsername);
  };

  const addBlacklistProxy = async ({ followerUsername, followerPk }) => {
    await addBlacklist({ username: followerUsername, pk: followerPk, source: sourceUsername, sourceType: 'account' });
  };

  const addTargetProxy = async ({ followerUsername, followerPk }) => {
    await addPotentialTarget({ username: followerUsername, pk: followerPk, source: sourceUsername, sourceType: 'account' });
  };

  await scrape({ ig: bot.ig, sourceUsername, isBlacklisted, addBlacklist: addBlacklistProxy, addTarget: addTargetProxy });

  process.exit(0);
})();
