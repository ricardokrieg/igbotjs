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

const debug = _debug('bot:vtope');

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

    // await visitSelfProfile(client);
    // await sleep(2000);
    //
    // await visitEditProfile(client);
    // await sleep(2000);
    //
    // await updateBiography(client, `815904`);
    // await sleep(2000);

    // const orderInfo = await subscriptionService.order(username);
    // const orderId = orderInfo.order;

    await addPost(client, images[1]);
    await sleep(60000);
    // await addPost(client, images[2]);
    // await sleep(60000);
    // await addPost(client, images[3]);
    // await sleep(60000);
    // await addPost(client, images[4]);
    // await sleep(60000);
    // await addPost(client, images[5]);
    // await sleep(60000);
    // await addPost(client, images[6]);
    // await sleep(60000);

    // await addStory(client, images[7], randomReelsTitle());
    // await sleep(60000);
    // await addStory(client, images[8], randomReelsTitle());
    // await sleep(60000);
    // await addStory(client, images[9], randomReelsTitle());
    // await sleep(60000);

    const accountId = client.getUserId();
    // const dizu = new DizuAPI();
    const vtope = new VtopeAPI();

    // const orderStatus = await subscriptionService.status(orderId);
    // if (orderStatus.status !== 'Completed') {
    //   await getInput(`Account ${username} is ready to be added to Dizu?`);
    // }

    // await dizu.addAccount(username);
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

    let count = 0;
    while (count < 6000) {
      debug(`Follow #${count + 1}`);

      const data = await vtope.getTask(atoken);

      if (!data.shortcode || !data.id) {
        debug(`Got invalid task from VTope`);
        await sleep(10000);
        continue;
      }

      try {
        debug(`Searching ${data.shortcode}`);
        const {user, is_private, following} = await search(client, data.shortcode, true, count === 0);

        if (!is_private && !following) {
          debug(`Following ${data.shortcode}`);
          await follow(client, user);
          await vtope.submitTask(data.id, atoken);
          count++;
        } else {
          debug(`Skipped ${data.shortcode} isPrivate=${is_private} following=${following}`);
          await vtope.skipTask(data.id, atoken);
        }
      } catch (error) {
        debug(`Error when searching/following:`);
        debug(error);

        await vtope.skipTask(data.id, atoken);

        if (error.message === 'challenge_required' || error.message === 'feedback_required') {
          break;
        }
      }

      await sleep(10000);
    }
  } catch (err) {
    console.error(err);
  }
})();
