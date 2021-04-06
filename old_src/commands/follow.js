const { logHandler } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('../Bot');

const username = process.env.IG_USERNAME;


(async () => {
  log('Start');

  const bot = new Bot({ username });

  try {
    await bot.setup();
    await bot.sessionManager.login();

    await bot.followManager.followTargets({ limit: 10 });
  } catch (e) {
    log.error(e);
    process.exit(1);
  }

  process.exit(0);
})();