const { sleep, logHandler, longSleep, randomBirthday, generateUsername } = require('../../utils');
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

const proxies = [
  'http://jqxdg:BMrJkHMW@conn4.trs.ai:61616', // AllProxy - 0

  'http://proxy:xxx123xxx@datacenter.mobileproxy.network:20810', // Henry - IPV4 DC - 1
  'http://proxy:xxx123xxx@datacenter.mobileproxy.network:20811', // 2

  'http://Selricardokrieg:B0m3QiY@92.63.195.185:45785', // Proxy-Seller - IPV4 - 3
  'http://Selricardokrieg:B0m3QiY@93.88.77.30:45785', // 4
  'http://Selricardokrieg:B0m3QiY@37.44.198.75:45785', // 5
  'http://Selricardokrieg:B0m3QiY@45.132.50.64:45785', // 6
  'http://Selricardokrieg:B0m3QiY@85.202.87.243:45785', // 7
  'http://Selricardokrieg:B0m3QiY@85.235.82.166:45785', // 8
  'http://Selricardokrieg:B0m3QiY@45.137.189.247:45785', // 9
  'http://Selricardokrieg:B0m3QiY@91.236.120.92:45785', // 10
  'http://Selricardokrieg:B0m3QiY@45.135.132.158:45785', // 11
  'http://Selricardokrieg:B0m3QiY@91.228.239.226:45785', // 12
  'http://Selricardokrieg:B0m3QiY@185.30.99.20:45785', // 13
  'http://Selricardokrieg:B0m3QiY@87.251.69.194:45785', // 14

  'http://4g.hydraproxy.com:4559', // 15

  'http://o.mobileproxy.space:63017', // 16
];
const proxy = proxies[process.env.PROXY_INDEX];

const acc = {
  username: 'teresinacupom[RANDOM]',
  password: 'xxx123xxx',
  proxy: proxy,
  first_name: 'Teresina Cupom',
  bio: 'Segue a gente pra ficar por dentro de promoções exclusivas nos bares e restaurantes de Teresina',
  message: 'Você {foi sorteado e ganhou|ganhou} um cupom de R$5 na @brabosburguerthe. É uma hamburgueria artesanal do Dirceu. Não se esquece de seguir @brabosburguerthe pra poder usar o cupom.',
};

(async () => {
  log('Start');

  const username = generateUsername({ username: acc.username });
  log(username);

  const bot = new Bot({ username });

  await bot.dbManager.createAccountDoc({ data: omit(acc, ['username', 'first_name', 'bio', 'message']) });
  await bot.setup();

  const {day, month, year} = randomBirthday();

  const input_phone_number_callback = async () => {
    return await SMSHubApi.getNumber();
  }

  const input_code_callback = async ({ phone_number }) => {
    return await SMSHubApi.getCode();
  }

  await bot.sessionManager.createAccountWithPhoneNumber(
    { ...acc, username, day, month, year },
    input_phone_number_callback,
    input_code_callback
  );
  await longSleep();

  await bot.accountManager.changeProfilePictureAndFirstPost({ path: './profile.jpg' });
  // await bot.accountManager.changeProfilePictureAndFirstPost({ path: './img_6523.2.jpg' });
  await longSleep();

  await bot.accountManager.editProfile({
    bio: acc.bio,
  });
  await longSleep();

  // await bot.ig.account.setPrivate();
  // await longSleep();

  let publishResult = await bot.publishManager.publishImage({
    imagePath: './images/teresinapromocoes1.jpg',
    caption: '',
    useLocation: false
  });
  log(publishResult);
  await longSleep();

  publishResult = await bot.publishManager.publishImage({
    imagePath: './images/teresinapromocoes2.jpg',
    caption: '',
    useLocation: false
  });
  log(publishResult);
  await longSleep();

  const source = await retry(() => bot.ig.user.searchExact('brabosburguerthe'));
  const sourcePk = source.pk;

  const spinner = new Spinner(acc.message);
  log(`Spinner total variations: ${spinner.countVariations()}`);

  log('Sending DMs...');
  let dmCount = 0;
  let dmLimit = 20;

  // const targets = await getTargets();
  const targets = [
    // { pk: '196431294', username: 'ricardokrieg' },
    ...await getTargets(),
  ];
  log(`${targets.length} total targets`);

  for (let target of targets) {
    const targetUsername = target['username'];
    const targetPK = target['pk'];

    log(`Sending DM to ${targetUsername}...`);

    const message = spinner.unspinRandom(1)[0];
    try {
      await sendProfile({ ig: bot.ig, pk: targetPK, profileId: sourcePk });
      await sendMessage({ ig: bot.ig, pk: targetPK, message });
    } catch (e) {
      log.error(e.message);
      process.exit(1);
    }

    await bot.statsManager.addToDirect({ message, pk: targetPK, project: process.env.PROJECT, target: targetUsername });
    await addBlacklist({ username: targetUsername, pk: targetPK });
    await removeTarget(targetUsername);

    dmCount++;
    log(`Sent ${dmCount} of ${dmLimit}`);
    if (dmCount >= dmLimit) {
      break;
    }

    await longSleep();
  }

  log(username);

  process.exit(0);
})();
