const { logHandler } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('./Bot');

const username = 'diandraratter';


(async () => {
  log('Start');

  try {
    const bot = new Bot({ username });
    await bot.setup();
    await bot.sessionManager.login();
    await bot.accountManager.editProfile({  });
  } catch (e) {
    log.error(e);
    process.exit(1);
  }

  process.exit(0);
})();
