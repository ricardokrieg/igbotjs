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

const proxies = [
  'http://jqxdg:BMrJkHMW@conn4.trs.ai:61616', // AllProxy - 0
];
const proxy = proxies[process.env.PROXY_INDEX];

const usernames = [
  'carool_da',
  'carool_db',
  'carool_dd',
  'carool_dc',
  'carool_de',
  'carool_df',
  'carool_dg',
  'carool_dh',
  'carool_di',
  'carool_dj',
];

const acc = {
  username: usernames[0],
  password: 'xxx123xxx',
  proxy: proxy,
  first_name: 'Carol Dias',
  // TODO: set bio
  bio: 'Segue a gente pra ficar por dentro de promoções exclusivas nos bares e restaurantes de Teresina',
  // TODO: set message
  message: 'Você {foi sorteado e ganhou|ganhou} um cupom de R$5 na @brabosburguerthe. É uma hamburgueria artesanal do Dirceu. Não se esquece de seguir @brabosburguerthe pra poder usar o cupom.',
};

(async () => {
  log('Start');

  const username = acc.username;
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

  // TODO: pick new pictures
  await bot.accountManager.changeProfilePictureAndFirstPost({ path: './profile.jpg' });
  await longSleep();

  await bot.accountManager.editProfile({
    bio: acc.bio,
  });
  await longSleep();

  // TODO: set private?
  // await bot.ig.account.setPrivate();
  // await longSleep();

  // TODO: pick new pictures
  let publishResult = await bot.publishManager.publishImage({
    imagePath: './images/teresinapromocoes1.jpg',
    caption: '',
    useLocation: false
  });
  log(publishResult);
  await longSleep();

  // TODO: pick new pictures
  publishResult = await bot.publishManager.publishImage({
    imagePath: './images/teresinapromocoes2.jpg',
    caption: '',
    useLocation: false
  });
  log(publishResult);
  await longSleep();

  // TODO: pick manual targets
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
