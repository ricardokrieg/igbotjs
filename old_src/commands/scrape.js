const { logHandler } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('../Bot');

const username = process.env.IG_USERNAME;
const target = process.env.IG_TARGET;


(async () => {
  log('Start');

  const bot = new Bot({ username });

  try {
    await bot.setup();
    await bot.sessionManager.login();

    await bot.followManager.scrape({ sourceUsername: target });
  } catch (e) {
    log.error(e);
    process.exit(1);
  }

  process.exit(0);
})();
