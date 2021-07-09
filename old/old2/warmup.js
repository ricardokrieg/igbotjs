const { random, isEmpty } = require('lodash');
const moment = require('moment');
const { logHandler } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('./Bot');
const { sleep } = require('./utils');

moment.locale('pt-br');

const username = process.env.IG_USERNAME;
const sandbox = !isEmpty(process.env.SANDBOX);

const SESSION_BEGIN = 6;
const SESSION_END   = 10;


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

      const nextSession = moment()
        .add(1, 'day')
        .hour( random(SESSION_BEGIN, SESSION_END) )
        .minute( random(0, 59) );
      log(`Next Session: ${nextSession.format()}`);

      const diff = nextSession.diff(moment());
      await sleep(diff);
    } catch (e) {
      // TODO, if it`s a Proxy timeout error (ERR_CONNECT)
      //   then just sleep and try again in 10 minutes
      log.error(e);
      break;
    }
  }

  process.exit(1);
})();
