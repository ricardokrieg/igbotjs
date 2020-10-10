const { random } = require('lodash');
const moment = require('moment');
const Spinner = require('node-spintax');
const { logHandler, longSleep, sleep } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('../Bot');
const SessionManager = require('../SessionManager');
const { sendMessage } = require('../actions/direct');

const N = 2;
const PHONE_NUMBER = '+12058294574';
// const PHONE_NUMBER = '+19092810391';

const acc = {
  username: `dirceudivulga${N}`,
  password: 'xxx123xxx',
  phone_number: PHONE_NUMBER,
  full_phone_number: PHONE_NUMBER,
  first_name: 'Dirceu Divulga',
};
// const username = acc.username;
const username = 'promosdirceu4';


(async () => {
  log('Start');

  try {
    const bot = new Bot({ username });
    await bot.setup();

    // await bot.sessionManager.createAccountPhoneNumber(acc);
    await bot.sessionManager.login();
    await longSleep();

    // const email = `${username}@gmx.com`;
    // log(`Adding email ${email} and profile pic...`);
    // await bot.accountManager.editProfile({
    //   bio: 'Divulgamos restaurantes, lanchonetes e outros estabelecimentos do Grande Dirceu',
    //   email,
    //   profilePic: './profile.jpg',
    // });
    // await longSleep();
    //
    // log('Removing phone number...');
    // await bot.accountManager.editProfile({
    //   phoneNumber: '',
    // });
    // await longSleep();
    //
    // log('Setting private...');
    // await bot.ig.account.setPrivate();
    // await longSleep();

    const accountDetails = await bot.dbManager.accountDetails();

    const spinner = new Spinner(accountDetails.message);
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

    const targetAccounts = await bot.dbManager.targetsCol().get();
    let targetUsernames = ['ricardokrieg'];

    targetAccounts.forEach((targetAccount) => {
      targetUsernames.push(targetAccount.ref.id);
    });

    for (let target of targetUsernames) {
      log(`Sending DM to ${target}...`);

      if (blacklist.includes(target)) {
        log(`Blacklisted. Skip.`);
        continue;
      }

      const message = spinner.unspinRandom(1)[0];
      await SessionManager.call( () => sendMessage({ ig: bot.ig, target, message }) );
      await bot.dbManager.dmsCol().add({ target, pk: '???', account: username, message });

      dmCount++;
      log(`Sent ${dmCount} of 10`);
      if (dmCount >= 10) {
        return;
      }

      await longSleep();
    }
  } catch (e) {
    log.error(e);
    process.exit(1);
  }

  process.exit(0);
})();
