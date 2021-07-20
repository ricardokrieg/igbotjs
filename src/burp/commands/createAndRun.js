const inquirer = require('inquirer');
const _debug = require('debug');

const Client = require('../client');
const openApp = require("../actions/openApp");
const signUp = require("../actions/signUp");
const signUpCompleteProfile = require("../actions/signUpCompleteProfile");
const feedSignup = require("../actions/feedSignUp");
const visitSelfProfile = require("../actions/visitSelfProfile");
const visitEditProfile = require("../actions/visitEditProfile");
const updateBiography = require("../actions/updateBiography");
const addPost = require("../actions/addPost");
const addStory = require("../actions/addStory");
const search = require("../actions/search");
const follow = require("../actions/follow");
const DizuAPI = require('../DizuAPI');
const VtopeAPI = require('../VtopeAPI');
const SMSService = require('../SMSService');
const SubscriptionService = require('../SubscriptionService');
const {
  sleep,
  generateAttrs,
  randomFilesFromPath,
  generateName,
  randomReelsTitle,
} = require('../utils');

const debug = _debug('bot:run');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const smsService = new SMSService();
const subscriptionService = new SubscriptionService();

const getInput = async (message) => {
  const { input } = (await inquirer.prompt([
    {
      type: 'input',
      name: 'input',
      message,
    },
  ]));

  return input;
}

const getPrefix = async (country) => {
  if (country === 'BR' && false) {
    return getInput('Prefix');
  } else {
    return smsService.getPrefix();
  }
};

const getPhoneNumber = async (country) => {
  if (country === 'BR' && false) {
    return getInput('Phone Number');
  } else {
    return smsService.getPhoneNumber();
  }
};

const getVerificationCode = async (country) => {
  if (country === 'BR' && false) {
    return getInput('Verification Code');
  } else {
    return smsService.getVerificationCode();
  }
};

const confirmSMS = async (country) => {
  if (country === 'RU' || true) {
    return smsService.setStatusDone();
  }
};

(async () => {
  try {
    const attrs = generateAttrs(`RU`);
    debug(attrs);

    const client = new Client(attrs);
    const images = randomFilesFromPath(`/Users/wolf/Downloads/cats/fitchicksinworkoutgear/`, 20);

    const { first_name, last_name, suggested_username } = generateName();

    const userInfo = {
      name: `${first_name} ${last_name}`,
      suggestedUsername: suggested_username,
      password: 'xxx123xxx',
      day: 10,
      month: 7,
      year: 1999,
      profileImage: images[0],
      shareToFeed: true,
      followRecommendedCount: 3,
    };
    debug(userInfo);

    await smsService.getBalance();
    await subscriptionService.balance();

    await openApp(client);
    await sleep(2000);

    const username = await signUp(client, userInfo, getPrefix, getPhoneNumber, getVerificationCode, confirmSMS);
    debug(`Username: ${username}`);
    client.setUsername(username);
    await sleep(2000);

    await signUpCompleteProfile(client, userInfo);
    await sleep(2000);

    await feedSignup(client);
    await sleep(2000);

    await visitSelfProfile(client);
    await sleep(2000);

    await visitEditProfile(client);
    await sleep(2000);

    await updateBiography(client, `815904`);
    await sleep(2000);

    const orderInfo = await subscriptionService.order(username);
    const orderId = orderInfo.order;

    let n = 1;
    for (let i = 0; i < 15; i++) {
      await addPost(client, images[n]);
      await sleep(60000);
      n++;
    }

    for (let i = 0; i < 3; i++) {
      await addStory(client, images[n], randomReelsTitle());
      await sleep(60000);
      n++;
    }

    const accountId = client.getUserId();
    const dizu = new DizuAPI();
    const vtope = new VtopeAPI();

    const orderStatus = await subscriptionService.status(orderId);
    if (orderStatus.status !== 'Completed') {
      // await getInput(`Account ${username} is ready to be added to Dizu?`);
    }

    await dizu.addAccount(username);
    const { atoken } = await vtope.addAccount(username, accountId);
    if (!atoken) {
      console.error(`Account ${username} (${accountId}) not added correctly`);
      return Promise.reject();
    }

    let status = 'validating';
    while (status === 'validating') {
      await sleep(10000);
      const accountInfo = await vtope.accountInfo(atoken);
      status = accountInfo.status;
    }

    if (status !== 'ok') {
      console.error(`Account ${username} (${accountId}) with bad status: ${status}`);
      return Promise.reject();
    }

    let vtopeTasks = 0;
    let isVtopeTask = false;
    let count = 0;
    while (count < 6000) {
      debug(`Follow #${count + 1}`);

      let data = null;
      let targetUsername;

      if (vtopeTasks > 0) {
        isVtopeTask = true;
        debug(`Getting task from VTope (${vtopeTasks} remaining)`);
        data = await vtope.getTask(atoken);
        vtopeTasks--;

        if (!data.shortcode || !data.id) {
          debug(`Got invalid task from VTope`);
          continue;
        }

        targetUsername = data.shortcode;
      } else {
        isVtopeTask = false;
        debug(`Getting task from Dizu`);
        data = await dizu.getTask(accountId);

        if (data === null) {
          debug(`Got invalid task from Dizu`);
          debug(`Getting 10 tasks from VTope`);

          vtopeTasks = 10;
          continue;
        }

        targetUsername = data.username;
      }

      try {
        debug(`Searching ${targetUsername}`);
        const {user, is_private, following} = await search(client, targetUsername, true, count === 0);

        if (!is_private && !following) {
          debug(`Following ${targetUsername}`);
          await follow(client, user);

          let result;
          if (isVtopeTask) {
            result = await vtope.submitTask(data.id, atoken);
          } else {
            result = await dizu.submitTask(data.connectFormId, accountId);
          }
          count++;

          await sleep(10000);
        } else {
          debug(`Skipped ${targetUsername} isPrivate=${is_private} following=${following}`);

          if (isVtopeTask) {
            await vtope.skipTask(data.id, atoken);
          } else {
            await dizu.skipTask(data.connectFormId, accountId);
          }
        }
      } catch (error) {
        debug(`Error when searching/following:`);
        debug(error);

        if (isVtopeTask) {
          await vtope.skipTask(data.id, atoken);
        } else {
          await dizu.skipTask(data.connectFormId, accountId);
        }

        if (error.message === 'challenge_required' || error.message === 'feedback_required') {
          break;
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
})();
