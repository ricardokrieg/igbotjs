const { logHandler, longSleep, randomBirthday, generateUsername } = require('../../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('../../Bot');
const axios = require('axios').default;

const PROJECT = process.env.PROJECT;

const acc = {
  username: '_daenerys_[RANDOM]',
  password: 'xxx123xxx',
  proxy: 'http://proxy:xxx123xxx@178.63.236.63:20810',
  first_name: 'Daenerys'
};

(async () => {
  log('Start');

  const username = generateUsername({ username: acc.username });
  log(username);

  const bot = new Bot({ username });

  await bot.dbManager.createAccountDoc({ data: { password: acc.password, proxy: acc.proxy } });
  await bot.setup();

  const { day, month, year } = randomBirthday();

  await bot.sessionManager.createAccountWithPhoneNumber({ ...acc, username, day, month, year });
  await longSleep();

  await bot.accountManager.changeProfilePictureAndFirstPost({ path: './profile.jpg' });
  await longSleep();

  const publishResult = await bot.publishManager.publishImage({
    imagePath: './images/2016-12-22 14.00.10 1411014106709983103_253456238.jpg',
    caption: '',
    useLocation: false
  });
  log(publishResult);

  const vtopeUser = `5018924`;
  const vtopeKey = `Rk5JnrXXr3pUOuwh`;
  const vtopeUrl = `https://vto.pe/botcontrol/bot/action`;
  const vtopeParams = {
    user: vtopeUser,
    key: vtopeKey,
    action: `accounts_add`,
    bot: 2538645,
    service: `i`,
    login: username,
    password: acc.password,
    proxy_mode: `auto`,
  };

  const response = await axios.post(vtopeUrl, vtopeParams);
  log(response);

  process.exit(0);
})();
