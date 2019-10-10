const { random } = require('lodash');
const moment = require('moment');
const { logHandler, longSleep } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('./Bot');
const { sleep } = require('./utils');

const username = process.env.IG_USERNAME;
const acc = {
  username: 'megathread123_';
  password: 'xxx123xxx';
  email: 'megathread123_@yahoo.com';
  first_name: 'The Mega';
};


(async () => {
  log('Start');

  const bot = new Bot({ username });
  await bot.setup();

  await bot.sessionManager.login();
  await longSleep();

  await bot.sessionManager.logout();
  await longSleep();

  const resp = await bot.sessionManager.createAccount(acc);
  log(resp);
  await longSleep();

  process.exit(0);
})();
