const { random } = require('lodash');
const moment = require('moment');
const { logHandler, longSleep, sleep } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('../Bot');

const acc = {
  username: 'henryproxy_1',
  password: 'xxx123xxx',
  email: 'henryproxy_1@wpsavy.com',
  first_name: 'Henry P',
};
const username = acc.username;


(async () => {
  log('Start');

  const bot = new Bot({ username });
  await bot.setup();

  const resp = await bot.sessionManager.newCreateAccount(acc);
  log(resp);
  await longSleep();

  process.exit(0);
})();
