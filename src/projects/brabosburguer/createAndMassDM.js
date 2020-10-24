const { sleep, logHandler, longSleep, randomBirthday, generateUsername } = require('../../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Spinner = require('node-spintax');
const { omit } = require('lodash');
const Bot = require('../../Bot');
const { sendMessage } = require('../../actions/direct');
const SMSHubApi = require('../../sms/smshub');
const addBlacklist = require('../../v2/firestore/addBlacklist');
const removeTarget = require('../../v2/firestore/removeTarget');
const getTargets = require('../../v2/firestore/getTargets');

const acc = {
  username: 'teresinacupom[RANDOM]',
  password: 'xxx123xxx',
  proxy: 'http://gEDBB0n:YxTl5eY@de9.proxidize.com:56242',
  first_name: 'Teresina Cupom',
  bio: 'Segue a gente pra ficar por dentro de promoções exclusivas nos bares e restaurantes de Teresina',
  // bio: 'Perfil novo. Teresina',
  message: '{Oi|Olá}. {Estou|To} {fazendo uma parceria com a|fazendo a divulgação da|trabalhando na divulgação da|divulgando a} {@brabosburguerthe|👉 @brabosburguerthe 👈}. É uma hamburgueria artesanal do Dirceu 🍔. Os hamburgueres são {ótimos|maravilhosos|gostosos} e são bem {baratos|baratos também}. {Aí você pode usar|Aí você usa} o cupom NBA5 pra ganhar um desconto de R$5 reais no primeiro pedido. Ajuda a gente aí 🙏. Eles começam a atender a partir das 19h {😛|🤙|💪|👍}',
  // message: 'Já conhece a @brabosburguerthe ?? É hamburguer artesanal aqui do Dirceu. Ajuda a gente aí 🙏',
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

  const input_code_callback = async ({ phone_prefix, phone_number }) => {
    return await SMSHubApi.getCode();
  }

  await bot.sessionManager.createAccountWithPhoneNumber(
    { ...acc, username, day, month, year },
    // input_phone_number_callback,
    // input_code_callback
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

  const spinner = new Spinner(acc.message);
  log(`Spinner total variations: ${spinner.countVariations()}`);

  log('Sending DMs...');
  let dmCount = 0;
  let dmLimit = 20;

  const targets = await getTargets();
  log(`${targets.length} total targets`);

  for (let target of targets) {
    const targetUsername = target['username'];
    const targetPK = target['pk'];

    log(`Sending DM to ${targetUsername}...`);

    const message = spinner.unspinRandom(1)[0];
    try {
      await sendMessage({ ig: bot.ig, pk: targetPK, message });
    } catch (e) {
      log.error(e.message);
      process.exit(1);
    }

    await bot.statsManager.addToDirect({ message, pk: targetPK, project: process.env.PROJECT, target: targetUsername });
    // await bot.statsManager.addToBlacklist({ username: targetUsername, params: { pk: targetPK, project: PROJECT } });
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
