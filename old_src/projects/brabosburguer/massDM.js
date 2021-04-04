const { logHandler, longSleep, inputUsername } = require('../../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Spinner = require('node-spintax');
const Bot = require('../../Bot');
const { sendMessage, sendProfile } = require('../../actions/direct');
const addBlacklist = require('../../v2/firestore/addBlacklist');
const removeTarget = require('../../v2/firestore/removeTarget');
const getTargets = require('../../v2/firestore/getTargets');
const retry = require('../../v2/utils/retry');

// const message = '{Oi|Olá}. {Estou|To} {fazendo uma parceria com a|fazendo a divulgação da|trabalhando na divulgação da|divulgando a} {@brabosburguerthe|👉 @brabosburguerthe 👈}. É uma hamburgueria artesanal do Dirceu 🍔. Os hamburgueres são {ótimos|maravilhosos|gostosos} e são bem {baratos|baratos também}. {Aí você pode usar|Aí você usa} o cupom NBA5 pra ganhar um desconto de R$5 reais no primeiro pedido. Ajuda a gente aí 🙏. Eles começam a atender a partir das 19h {😛|🤙|💪|👍}';
const message = 'Você {foi sorteado e ganhou|ganhou} um cupom de R$5 na @brabosburguerthe. É uma hamburgueria artesanal do Dirceu. Não se esquece de seguir @brabosburguerthe pra poder usar o cupom.';

(async () => {
  log('Start');

  const username = process.env.IG_USERNAME || await inputUsername();
  log(username);

  const bot = new Bot({ username });
  await bot.setup();

  await bot.sessionManager.login();

  await bot.accountManager.changeProfilePictureAndFirstPost({ path: './profile.jpg' });
  await longSleep();

  await bot.accountManager.editProfile({
    bio: 'Segue a gente pra ficar por dentro de promoções exclusivas nos bares e restaurantes de Teresina',
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

  const spinner = new Spinner(message);
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

  process.exit(0);
})();
