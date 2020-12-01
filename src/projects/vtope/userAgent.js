const { logHandler, longSleep, randomBirthday, generateUsername } = require('../../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Spinner = require('node-spintax');
const { omit } = require('lodash');
const Bot = require('../../Bot');
const { sendMessage, sendProfile } = require('../../actions/direct');
const SMSHubApi = require('../../sms/smshub');
const addBlacklist = require('../../v2/firestore/addBlacklist');
const removeTarget = require('../../v2/firestore/removeTarget');
const getTargets = require('../../v2/firestore/getTargets');
const retry = require('../../v2/utils/retry');

(async () => {
  log('Start');

  let username = 'slow200p';
  log(username);

  let bot = new Bot({ username });
  await bot.setup();

  await bot.sessionManager.login();

  log('webUserAgent:');
  log(bot.ig.state.webUserAgent);
  log('device_id:');
  log(bot.ig.state.deviceId);
  log('phone_id:');
  log(bot.ig.state.phoneId);
  log('uuid:');
  log(bot.ig.state.uuid);
  log('adid:');
  log(bot.ig.state.adid);
  log('cookieCsrfToken:');
  log(bot.ig.state.cookieCsrfToken);
  log('mid:');
  log(bot.ig.state.extractCookie('mid'));
  log('rur:');
  log(bot.ig.state.extractCookie('rur'));
  log('');
  log('');
  log('');
  log(`${username}:xxx123xxx|${bot.ig.state.webUserAgent}|${bot.ig.state.deviceId};${bot.ig.state.phoneId};${bot.ig.state.uuid};${bot.ig.state.adid}|csrftoken=${bot.ig.state.cookieCsrfToken};mid=${bot.ig.state.extractCookie('mid')};rur=${bot.ig.state.extractCookie('rur')}|http:192.168.42.243::|`);

  process.exit(0);
})();
