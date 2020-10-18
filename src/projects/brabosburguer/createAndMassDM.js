const { logHandler, longSleep, randomBirthday, generateUsername } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Spinner = require('node-spintax');
const Bot = require('../Bot');
const { sendMessage, sendMessageToGroup } = require('../actions/direct');

const PROJECT = process.env.PROJECT;

const acc = {
  username: 'teresinacupom[RANDOM]',
  password: 'xxx123xxx',
  first_name: 'Teresina Cupom',
  bio: 'Segue a gente pra ficar por dentro de promoções exclusivas nos bares e restaurantes de Teresina',
  message: '{Oi|Olá}. {Estou|To} {fazendo uma parceria com a|fazendo a divulgação da|trabalhando na divulgação da|divulgando a} {@brabosburguerthe|👉 @brabosburguerthe 👈}. É uma hamburgueria artesanal do Dirceu 🍔. Os hamburgueres são {ótimos|maravilhosos|gostosos} e são bem {baratos|baratos também}. {Aí você pode usar|Aí você usa} o cupom {MVP10 pra ganhar um desconto de R$10|MVP10 pra ganhar um desconto de R$10|MVP10 pra ganhar um desconto de R$10|NBA5 pra ganhar um desconto de R$5} reais no primeiro pedido. Ajuda a gente aí 🙏. Eles começam a atender a partir das 19h {😛|🤙|💪|👍}',
};

// teresinacupoms5396

(async () => {
  log('Start');

  let username;
  let shouldCreate = true;
  if (process.env.IG_USERNAME) {
    username = process.env.IG_USERNAME;
    shouldCreate = false;
  } else {
    username = generateUsername({ username: acc.username });
  }
  log(username);

  const bot = new Bot({ username });

  if (shouldCreate) {
    await bot.dbManager.createAccountDoc({data: {password: acc.password}});
  }

  await bot.setup();

  if (shouldCreate) {
    const {day, month, year} = randomBirthday();

    await bot.sessionManager.createAccountWithPhoneNumber({ ...acc, username, day, month, year });
    await longSleep();

    await bot.accountManager.changeProfilePictureAndFirstPost({ path: './profile.jpg' });
    await longSleep();

    await bot.accountManager.editProfile({
      bio: acc.bio,
    });
    await longSleep();

    await bot.ig.account.setPrivate();
    await longSleep();
  } else {
    await bot.sessionManager.login();
    await longSleep();
  }

  const spinner = new Spinner(acc.message);
  log(`Spinner total variations: ${spinner.countVariations()}`);

  let blacklist = [];
  const blacklistDocs = await bot.dbManager.dmsCol().select('target').get();
  for (let blacklistDoc of blacklistDocs.docs) {
    blacklist.push(blacklistDoc.get('target'));
  }

  log('Blacklist:');
  log(blacklist);

  log('Sending DMs...');
  let dmCount = 0;
  let dmLimit = 20;
  let groupLimit = 10;

  const targetAccounts = await bot.dbManager.targetsCol().get();
  let targetUsernames = ['ricardokrieg'];

  targetAccounts.forEach((targetAccount) => {
    const target = targetAccount.ref.id;

    if (target === 'ricardokrieg' || !blacklist.includes(target)) {
      targetUsernames.push(target);
    }
  });

  log(`${targetUsernames.length} total targets`);

  if (process.env.IG_GROUP) {
    const message = spinner.unspinRandom(1)[0];

    targetUsernames = targetUsernames.slice(0, groupLimit);
    log(`Sending DM to ${targetUsernames.length} users...`);
    await sendMessageToGroup({ ig: bot.ig, targets: targetUsernames, message });
    log(`Sent`);

    for (let target of targetUsernames) {
      await bot.dbManager.dmsCol().add({ target, pk: '???', account: username, message });
    }
  } else {
    for (let target of targetUsernames) {
      log(`Sending DM to ${target}...`);

      const message = spinner.unspinRandom(1)[0];
      await sendMessage({ ig: bot.ig, target, message });
      await bot.dbManager.dmsCol().add({ target, pk: '???', account: username, message });

      dmCount++;
      log(`Sent ${dmCount} of ${dmLimit}`);
      if (dmCount >= dmLimit) {
        break;
      }

      await longSleep();
    }
  }

  process.exit(0);
})();
