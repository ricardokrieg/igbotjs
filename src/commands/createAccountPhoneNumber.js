const { random } = require('lodash');
const moment = require('moment');
const { logHandler, longSleep, sleep } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('../Bot');

const acc = {
  username: 'teresinapromonews6',
  password: 'xxx123xxx',
  phone_number: '+19163099699',
  full_phone_number: '+19163099699',
  first_name: 'Teresina Promo News',
};
const username = acc.username;


(async () => {
  log('Start');

  const bot = new Bot({ username });
  await bot.setup();

  const resp = await bot.sessionManager.createAccountPhoneNumber(acc);
  log(resp);
  await longSleep();

  process.exit(0);
})();
