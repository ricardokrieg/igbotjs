const { logHandler } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('./Bot');

const username = 'stefjoe17';


(async () => {
  log('Start');

  try {
    const bot = new Bot({ username });
    await bot.simulate();
  } catch (e) {
    log.error(e);
    process.exit(1);
  }

  log('End');
  process.exit(0);
})();
