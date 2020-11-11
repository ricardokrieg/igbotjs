const { logHandler, longSleep, randomBirthday, generateUsername } = require('../../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Spinner = require('node-spintax');
const { omit, sample } = require('lodash');
const Bot = require('../../Bot');
const { sendMessage, sendLink } = require('../../actions/direct');
const SMSHubApi = require('../../sms/smshub');
const addBlacklist = require('../../v2/firestore/addBlacklist');
const removeTarget = require('../../v2/firestore/removeTarget');
const getTargets = require('../../v2/firestore/getTargets');
const retry = require('../../v2/utils/retry');

const acc = {
  username: 'deborah_linst2',
  usernameForDevice: 'giohh_andradee',
  password: 'xxx123xxx',
  proxy: 'http://proxy:xxx123xxx@datacenter.mobileproxy.network:20257',
  first_name: 'Debora Lins'
};

(async () => {
  log('Start');

  // const username = acc.username;
  let username = acc.usernameForDevice;
  log(username);

  let bot = new Bot({ username });

  // await bot.dbManager.createAccountDoc({ data: omit(acc, ['username', 'first_name', 'bio', 'message']) });
  await bot.setup();

  const {day, month, year} = randomBirthday();

  await bot.sessionManager.login();
  longSleep();
  await bot.sessionManager.logout();
  longSleep();

  username = acc.username;
  bot = new Bot({ username });
  await bot.dbManager.createAccountDoc({ data: omit(acc, ['username', 'first_name', 'bio', 'message']) });
  await bot.setup();

  await bot.sessionManager.createAccountWithEmail(
    { ...acc, username, day, month, year },
  );
  await longSleep();

  await bot.accountManager.changeProfilePictureAndFirstPost({ path: './images/namoradasfofos/profile3.jpg' });
  await longSleep();

  await bot.accountManager.editProfile({
    bio: 'Livre e sem compromisso\nSigam meu perfil e comentem a vontade\n',
  });
  await longSleep();

  let publishResult;
  for (let i of [1, 2, 3, 4]) {
    publishResult = await bot.publishManager.publishImage({
      imagePath: `./images/namoradasfofos/post${i}.jpg`,
      caption: '',
      useLocation: false
    });
    log(publishResult);
    await longSleep();
  }

  await bot.ig.account.setPrivate();
  await longSleep();

  log('Sending DMs...');
  let dmCount = 0;
  let dmLimit = 20;

  const message = 'Ve se esse meu video ficou bom';
  const link = `http://novinha.site/?u=${username}`;

  while (dmCount < dmLimit) {
    const targets = await getTargets({ limit: 10 });

    if (targets.length === 0) {
      log.error('No more targets');
      process.exit(1);
    }

    const target = sample(targets);

    const targetUsername = target['username'];
    const targetPK = target['pk'];

    await removeTarget(targetUsername);

    log(`Sending DM to ${targetUsername}...`);

    try {
      await sendLink({ ig: bot.ig, pk: targetPK, text: message, links: [link] });
    } catch (e) {
      log.error(e.message);
      process.exit(1);
    }

    await bot.statsManager.addToDirect({ message, pk: targetPK, project: process.env.PROJECT, target: targetUsername });
    await addBlacklist({ username: targetUsername, pk: targetPK });

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
