const { isUndefined, isEmpty, sample, random, last } = require('lodash');
const debug = require('debug')('bot:soctool:run');
const Promise = require('bluebird');
// const {Capabilities, Builder, By, until} = require('selenium-webdriver');
const {Lock} = require('semaphore-async-await');

const Client = require('./client');
const { usersUsernameInfo, usersInfo } = require('./users');
const { friendshipsCreate } = require('./friendships');
const { feedTimeline, feedReelsTray, feedUser, feedPopular } = require('./feed');
const { mediaSeen } = require('./media');
const start = require('./start');
const { sleepForDay, getFollowCountForDay } = require('./utils');
const AccountManager = require('./AccountManager');
const { sleep } = require('../src/v2/utils/sleep');

const VtopeAPI = require('../vtope/VtopeAPI');
const DizuAPI = require('../dizu/DizuAPI');
const DizuBrowser = require('../dizu_selenium/DizuBrowser');

const vtopeApi = new VtopeAPI();

const authorizeCommand = async (id, username) => {
  debug(`Authorizing ${username}`);

  const data = await vtopeApi.authorizeAccount({ id, username });
  debug(data);

  return data.atoken;
};

const mockAuthorizeCommand = async (id, username) => {
  debug(`[MOCK] Authorizing ${username}`);

  return null;
}

// const selectByVisibleText = async (element, text) => {
//   const options = await element.findElements(By.tagName('option'));
//   for (let option of options) {
//     const optionText = await option.getText();
//     if (optionText === text) {
//       option.click();
//       break;
//     }
//   }
// }

const run = async (username) => {
  // const userDataDir = process.argv[2] === 'mac' ? '/Users/wolf/Library/Application Support/Google/Chrome/Profile 2' : 'C:\\Users\\Dorinha Andrade\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1';
  // const chromeCapabilities = Capabilities.chrome();
  // chromeCapabilities.set('goog:chromeOptions', {
  //   args: [
  //     `--user-data-dir=${userDataDir}`,
  //   ],
  //   w3c: false,
  // });
  // const driver = await new Builder().withCapabilities(chromeCapabilities).build();
  // let element;

  debug(`Starting ${username}`);

  // const accountManager = new AccountManager(username, authorizeCommand);
  const accountManager = new AccountManager(username, mockAuthorizeCommand);

  await accountManager.loadAttrs();
  await accountManager.calculateStage();

  debug(`Day #${accountManager.attrs.day}`);

  const { followCount, minFollowCount, maxFollowCount } = getFollowCountForDay(accountManager.attrs.day);
  if (followCount < 1) {
    debug(`Rest day. Exiting.`);
    return;
  } else {
    debug(`Going to follow ${followCount} (${minFollowCount} ~ ${maxFollowCount})`);
  }

  // TODO day off should happen every 10% of days
  // TODO save the followCount in the account (or in a support collection), to not need to recalculate in case of re-run

  let data;
  let i = await accountManager.actionsToday() + 1;
  debug(`Actions today: ${i - 1}`);

  const client = new Client(accountManager.attrs);

  await start(client);
  await sleep(5000);

  // TODO this will be removed once TODO #2 is done
  if ((i - 1) >= minFollowCount) {
    debug(`Already reached ${followCount} actions today`);
    return;
  }

  // await vtopeApi.requestLike({ atoken: accountManager.attrs.atoken });
  // await sleep(30000);

  // await driver.get('https://dizu.com.br/painel/conectar');
  // element = await driver.wait(until.elementLocated(By.id('instagram_id')), 10000);
  // await selectByVisibleText(element, username);
  // element = await driver.wait(until.elementLocated(By.id('iniciarTarefas')), 10000);
  // element.click();

  while (true) {
    debug(`Follow #${i} of ${followCount}`);
    let taskId;

    try {
      // if (random(100) < 10) {
      //   await vtopeApi.requestLike({ atoken: accountManager.attrs.atoken });
      //   await sleep(30000);
      // }

      debug(`Requesting FOLLOW task...`);
      // data = await vtopeApi.requestFollow({ atoken: accountManager.attrs.atoken });
      // const task = await (new DizuAPI()).getTask(accountManager.attrs.dizuId);
      // debug(`Dizu API response:`);
      // data = { id: 0, shortcode: 'ricardokrieg' };
      // debug(task);
      // element = await driver.wait(until.elementLocated(By.linkText('Ver link')), 10000);
      // const href = await element.getAttribute('href');
      // const targetUsername = last(href.split('/'));
      await lock.wait();
      const targetUsername = await dizuBrowser.getTask(username);
      data = { targetUsername };
      debug(data);

      // const { id, shortcode } = data;
      // const { connectFormId, username, accountIdAction } = task;
      // taskId = id;
      // taskId = connectFormId;

      // TODO, maybe needs to replace with :usersInfo?
      // const { user } = await usersUsernameInfo(client, shortcode);
      const { user } = await usersUsernameInfo(client, targetUsername);
      debug(user);

      if (isUndefined(user)) {
        debug(`Account is not valid. Skipping.`);
        lock.signal();
        continue;
      }

      if (user.is_private) {
        debug(`Account ${user.username} is private. Skipping.`);
        lock.signal();
        continue;
      }

      await sleep(5000);
      const friendshipStatus = await friendshipsCreate(client, user.pk);
      await accountManager.saveAction(data);
      debug(friendshipStatus);

      debug(`Sending TASK_SUCCESS request...`);
      // data = await vtopeApi.taskSuccess({ atoken: accountManager.attrs.atoken, id: id });
      // data = await (new DizuAPI()).submitTask(task.connectFormId, task.accountIdAction);
      // debug(data);
      // element = await driver.wait(until.elementLocated(By.id('conectar_form')), 10000);
      // await element.submit();
      await dizuBrowser.submitTask();
      lock.signal();
      await sleep(5000);

      if (i >= followCount) break;

      const action = sample([`feedTimeline`, `feedUser`, `feedPopular`, `feedReelsTray`]);
      debug(`Random Action: ${action}`);

      switch (action) {
        case 'feedTimeline':
          await feedTimeline(client);
          break;
        case 'feedUser':
          await feedUser(client, accountManager.attrs.userId);
          break;
        case 'feedPopular':
          await feedPopular(client, accountManager.attrs.userId);
          break;
        case 'feedReelsTray':
          const { tray } = await feedReelsTray(client);
          if (!isEmpty(tray)) {
            await mediaSeen(client, tray[0].items);
          }
          break;
      }

      debug(`Follow #${i} of ${followCount}. Sleeping`);
      await sleepForDay(accountManager.attrs.day);

      i++;
    } catch (e) {
      console.error(`Error on Account ${username}`);
      console.error(e);

      // debug(`Sending TASK_ERROR request...`);
      // data = await vtopeApi.taskError({ atoken: accountManager.attrs.atoken, id: taskId, errorType: 'doerror' });
      // debug(data);

      break;
    }
  }
};

const dizuBrowser = process.argv[2] === 'mac' ? DizuBrowser.mac() : DizuBrowser.windows();
const lock = new Lock(1);

(async () => {
  await dizuBrowser.build();

  if (isUndefined(process.env.IG_USERNAME)) {
    const usernames = await AccountManager.allUsernames();

    const accounts = [];
    for (let username of usernames) {
      accounts.push(run(username));
      debug('Sleeping 5 minutes');
      await sleep(300000);
    }

    Promise.all(accounts);
  } else {
    await run(process.env.IG_USERNAME);
  }
})();
