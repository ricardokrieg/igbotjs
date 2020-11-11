const { sample } = require('lodash');
const { logHandler, longSleep, inputUsername } = require('../../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('../../Bot');
const { sendMessage, sendLink } = require('../../actions/direct');
const addBlacklist = require('../../v2/firestore/addBlacklist');
const removeTarget = require('../../v2/firestore/removeTarget');
const getTargets = require('../../v2/firestore/getTargets');
const retry = require('../../v2/utils/retry');

(async () => {
  log('Start');

  const username = process.env.IG_USERNAME || await inputUsername();
  log(username);

  const bot = new Bot({ username });
  await bot.setup();

  await bot.sessionManager.login();

  // await bot.accountManager.changeProfilePictureAndFirstPost({ path: './images/namoradasfofos/profile3.jpg' });
  // await longSleep();

  // await bot.accountManager.editProfile({
  //   bio: 'Livre e sem compromisso\nSigam meu perfil e comentem a vontade\n',
  // });
  // await longSleep();

  // let publishResult;
  // for (let i of [1, 2, 3, 4]) {
  //   publishResult = await bot.publishManager.publishImage({
  //     imagePath: `./images/namoradasfofos/post${i}.jpg`,
  //     caption: '',
  //     useLocation: false
  //   });
  //   log(publishResult);
  //   await longSleep();
  // }

  await bot.ig.account.setPrivate();
  await longSleep();

  log('Sending DMs...');
  let dmCount = 0;
  let dmLimit = 20;

  const message = 'Ve se esse meu video ficou bom';
  const link = `http://novinha.site/?u=${username}`;

  // const targets = [
  //   { pk: '196431294', username: 'ricardokrieg' },
  //   ...await getTargets()
  // ];

  // log(`${targets.length} total targets`);

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

  process.exit(0);
})();
