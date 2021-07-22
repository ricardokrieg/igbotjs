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
const SMSService = require('../SMSService');
const SubscriptionService = require('../SubscriptionService');
const {
  sleep,
  generateAttrs,
  randomFilesFromPath,
  generateName,
  randomReelsTitle,
} = require('../utils');

const debug = _debug('bot:dizu');

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
  if (country === 'BR') {
    return getInput('Prefix');
  } else {
    return smsService.getPrefix();
  }
};

const getPhoneNumber = async (country) => {
  if (country === 'BR') {
    return getInput('Phone Number');
  } else {
    return smsService.getPhoneNumber();
  }
};

const getVerificationCode = async (country) => {
  if (country === 'BR') {
    return getInput('Verification Code');
  } else {
    return smsService.getVerificationCode();
  }
};

const confirmSMS = async (country) => {
  if (country === 'RU' || country === 'FR') {
    return smsService.setStatusDone();
  }
};

(async () => {
  try {
    const attrs = generateAttrs(`RU`);
    // attrs.proxy = `http://192.168.15.30:8888`;
    debug(attrs);

    const client = new Client(attrs);
    const images = randomFilesFromPath(`/Users/wolf/Downloads/cats/fitchicksinworkoutgear/`, 10);

    const { first_name, last_name, suggested_username } = generateName();

    const userInfo = {
      first_name,
      last_name,
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
    for (let i = 0; i < 6; i++) {
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

    const orderStatus = await subscriptionService.status(orderId);
    if (orderStatus.status !== 'Completed') {
      // await getInput(`Account ${username} is ready to be added to Dizu?`);
    }

    await dizu.addAccount(username);
    await sleep(15000);

    let count = 0;
    while (count < 6000) {
      debug(`Follow #${count + 1}`);

      const data = await dizu.getTask(accountId);

      if (data === null) {
        debug(`Got invalid task from Dizu`);
        continue;
      }

      try {
        debug(`Searching ${data.username}`);
        const {user, is_private, following} = await search(client, data.username, true, count === 0);

        if (!is_private && !following) {
          debug(`Following ${data.username}`);
          await follow(client, user);
          await dizu.submitTask(data.connectFormId, accountId);
          count++;

          await sleep(10000);
        } else {
          debug(`Skipped ${data.username} isPrivate=${is_private} following=${following}`);
          await dizu.skipTask(data.connectFormId, accountId);
        }
      } catch (error) {
        debug(`Error when searching/following:`);
        debug(error);

        await dizu.skipTask(data.connectFormId, accountId);

        if (error.message === 'challenge_required' || error.message === 'feedback_required') {
          break;
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
})();
