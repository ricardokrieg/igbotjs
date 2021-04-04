const { logHandler } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('../Bot');
const SessionManager = require('../SessionManager');
const { inbox } = require('../actions/direct');

const username = process.env.IG_USERNAME;


(async () => {
  log('Start');

  const bot = new Bot({ username });

  try {
    await bot.setup();
    await bot.sessionManager.login();

    log('Loading inbox...');
    await SessionManager.call( () => inbox({ ig: bot.ig, showAll: true }) );
  } catch (e) {
    log.error(e);
    process.exit(1);
  }

  process.exit(0);
})();
