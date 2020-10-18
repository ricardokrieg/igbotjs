const { logHandler, longSleep, randomBirthday, generateUsername } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('../Bot');

const acc = {
  username: 'promocoes.teresina.[RANDOM]',
  password: 'xxx123xxx',
  first_name: 'Teresina Promo News',
  bio: 'Segue a gente pra ficar por dentro de promoções exclusivas nos bares e restaurantes de Teresina',
};

// find proxy provider
// find sms provider (cheap and reuse)
// const proxy = 'http://14ZGekW:kTSt2FJ@de9.proxidize.com:16273';
// const proxy = 'http://192.168.15.4:8888';

(async () => {
  log('Start');

  const username = generateUsername({ username: acc.username });
  log(username);

  // check username
  // if need to change username, copy/remove firestore doc
  // generate username: duplicate letter (eg: john -> joohn, jjohn, johhnn ...)

  const { day, month, year } = randomBirthday();

  const bot = new Bot({ username });
  // await bot.dbManager.createAccountDoc({ data: { password: acc.password, proxy } });
  await bot.dbManager.createAccountDoc({ data: { password: acc.password } });

  await bot.setup();

  await bot.sessionManager.createAccountWithPhoneNumber({ ...acc, username, day, month, year });
  await longSleep();

  // TODO fb/fb_entrypoint_info/
  // TODO discover/ayml/

  await bot.accountManager.changeProfilePictureAndFirstPost({ path: './profile.jpg' });
  await longSleep();

  // TODO discover/ayml/
  // TODO friendships/show_many/

  // remove phone (if reuse)

  await bot.ig.account.setPrivate();
  await longSleep();

  // const publishResult = await bot.publishManager.publishImage({
  //   imagePath: './images/2016-12-22 14.00.10 1411014106709983103_253456238.jpg',
  //   caption: 'Não perca promoções nos melhores bares de Teresina',
  //   useLocation: false
  // });
  // log(publishResult);

  // start mass DM
  // logout
  // send to VTope (with proxy info)

  process.exit(0);
})();
