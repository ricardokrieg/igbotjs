const { isUndefined, isEmpty, sample, random } = require('lodash');
const debug = require('debug')('bot:soctool:run');
const Promise = require('bluebird');

const Client = require('./client');
const { usersUsernameInfo, usersInfo } = require('./users');
const { friendshipsCreate } = require('./friendships');
const { feedTimeline, feedReelsTray, feedUser } = require('./feed');
const { mediaSeen } = require('./media');
const start = require('./start');
const { sleepForDay, getFollowCountForDay } = require('./utils');
const AccountManager = require('./AccountManager');
const { sleep } = require('../src/v2/utils/sleep');

const VtopeAPI = require('../vtope/VtopeAPI');

const api = new VtopeAPI();

const authorizeCommand = async (id, username) => {
  debug(`Authorizing ${username}`);

  const data = await api.authorizeAccount({ id, username });
  debug(data);

  return data.atoken;
};

const run = async (username) => {
  debug(`Starting ${username}`);

  const accountManager = new AccountManager(username, authorizeCommand);

  await accountManager.loadAttrs();
  await accountManager.calculateStage();

  debug(`Day #${accountManager.attrs.day}`);

  const { followCount, minFollowCount, maxFollowCount } = getFollowCountForDay(accountManager.attrs.day);
  if (followCount < 1) {
    debug(`Rest day. Exiting.`);
    process.exit(0);
  } else {
    debug(`Going to follow ${followCount} (${minFollowCount} ~ ${maxFollowCount})`);
  }

  let data;
  let i = await accountManager.actionsToday() + 1;
  debug(`Actions today: ${i - 1}`);

  const client = new Client(accountManager.attrs);

  await start(client);

  if (i >= minFollowCount) {
    debug(`Already reached ${followCount} actions today`);
    process.exit(0);
  }

  // await api.requestLike({ atoken: accountManager.attrs.atoken });
  // await sleep(30000);

  while (true) {
    debug(`Follow #${i} of ${followCount}`);
    let taskId;

    try {
      // if (random(100) < 10) {
      //   await api.requestLike({ atoken: accountManager.attrs.atoken });
      //   await sleep(30000);
      // }

      data = await api.requestFollow({ atoken: accountManager.attrs.atoken });
      debug(data);

      const { id, shortcode } = data;
      taskId = id;

      const { user } = await usersUsernameInfo(client, shortcode);
      await friendshipsCreate(client, user.pk);

      await accountManager.saveAction(data);

      data = await api.taskSuccess({ atoken: accountManager.attrs.atoken, id: id });
      debug(data);

      if (i >= followCount) break;
      i++;

      const action = sample([`feedTimeline`, `feedUser`, `feedReelsTray`]);
      debug(`Random Action: ${action}`);

      switch (action) {
        case 'feedTimeline':
          await feedTimeline(client);
          break;
        case 'feedUser':
          await feedUser(client, accountManager.attrs.userId);
          break;
        case 'feedReelsTray':
          const { tray } = await feedReelsTray(client);
          if (!isEmpty(tray)) {
            await mediaSeen(client, tray[0].items);
          }
          break;
      }

      await sleepForDay(accountManager.attrs.day);
    } catch (e) {
      console.error(`Error on Account ${username}`);
      console.error(e);

      data = await api.taskError({ atoken: accountManager.attrs.atoken, id: taskId, errorType: 'doerror' });
      debug(data);

      break;
    }
  }
};

(async () => {
  if (isUndefined(process.env.IG_USERNAME)) {
    const usernames = await AccountManager.allUsernames();

    const accounts = [];
    for (let username of usernames) {
      accounts.push(run(username));
      await sleep(30000);
    }

    Promise.all(accounts);
  } else {
    await run(process.env.IG_USERNAME);
  }
})();