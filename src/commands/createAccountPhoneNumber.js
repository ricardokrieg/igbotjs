const { random } = require('lodash');
const moment = require('moment');
const { logHandler, longSleep, sleep } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('../Bot');

const acc = {
  username: 'teresinapromonews21',
  password: 'xxx123xxx',
  phone_number: '+19179822930',
  full_phone_number: '+19179822930',
  first_name: 'Teresina Promo News',
};
const username = acc.username;
// const username = process.env.IG_USERNAME;


(async () => {
  log('Start');

  const bot = new Bot({ username });
  await bot.setup();

  // await bot.sessionManager.login();
  // await longSleep();
  //
  // await bot.sessionManager.logout();
  // await longSleep();

  const resp = await bot.sessionManager.createAccountPhoneNumber(acc);
  log(resp);
  await longSleep();

  process.exit(0);
})();
