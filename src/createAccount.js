const { random } = require('lodash');
const moment = require('moment');
const { logHandler, longSleep } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('./Bot');
const { sleep } = require('./utils');

const username = process.env.IG_USERNAME;
const acc = {
  username: 'sabujo20200922',
  password: 'xxx123xxx',
  email: 'sabujo20200922@a6mail.net',
  first_name: 'Sabujo',
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
