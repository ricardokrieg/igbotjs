const { random, isEmpty } = require('lodash');
const moment = require('moment');
const { logHandler } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('./Bot');
const { sleep } = require('./utils');

const username = process.env.IG_USERNAME;
const sandbox = !isEmpty(process.env.SANDBOX);


(async () => {
  log('Start');

  const bot = new Bot({ username, sandbox });
  try {
    await bot.setup();
  } catch (e) {
    log.error(e);
    process.exit(1);
  }

  while (true) {
    try {
      await bot.warmup();
      process.exit(0);

      // TODO these values can be custom per account
      if (moment().hour() >= 22 || moment().hour() <= 2) {
        // nightime. sleep 6~10h
        const nightms = random(6 * 60 * 60 * 1000, 10 * 60 * 60 * 1000);
        log(`Will back ${moment().add(nightms, 'ms').calendar()}`);
        await sleep(nightms);

        if (random(0, 100) <= 10) {
          // day off. sleep 24h
          const dayoffms = 24 * 60 * 60 * 1000;
          log(`Will back ${moment().add(dayoffms, 'ms').calendar()}`);
          await sleep(dayoffms);
        }
      } else {
        // coffee break. sleep 1~2h
        const ms = random(60 * 60 * 1000, 2 * 60 * 60 * 1000);
        log(`Will back ${moment().add(ms, 'ms').calendar()}`);
        await sleep(ms);
      }
    } catch (e) {
      // TODO, if it`s a Proxy timeout error (ERR_CONNECT)
      //   then just sleep and try again in 10 minutes
      log.error(e);
      break;
    }
  }

  process.exit(1);
})();
