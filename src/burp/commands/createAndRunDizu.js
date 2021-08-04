const inquirer = require('inquirer');
const _debug = require('debug');
const chance = require('chance').Chance();

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
  generateBirthday,
  randomReelsTitle,
  getIP,
  randomProfile,
  getProxy,
  getRandomBiography,
} = require('../utils');

const debug = _debug('bot:dizu');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.TZ = 'America/Fortaleza';

const minFollows = process.env.MIN;
if (!minFollows) {
  throw new Error(`MIN is required`);
}

const maxFollows = process.env.MAX;
if (!maxFollows) {
  throw new Error(`MAX is required`);
}

const proxyIndex = process.env.PROXY_INDEX;
if (!proxyIndex) {
  throw new Error(`PROXY_INDEX is required`);
}

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
  const start = new Date();
  let username;
  let ip;
  let total = chance.integer({ min: parseInt(minFollows), max: parseInt(maxFollows) });
  debug(`Going to follow ${total}`);
  let count = 0;

  let country = process.env.COUNTRY || `RU`;
  debug(`Country: ${country}`);

  try {
    debug(`Start: ${start.toLocaleTimeString()}`);

    const attrs = generateAttrs(country);
    attrs.proxy = getProxy(proxyIndex).address;
    debug(attrs);

    const client = new Client(attrs);
    ip = await getIP(client);

    debug(`IP (start): ${ip}`);

    const gender = 'female';
    const { profile, path } = randomProfile(gender);
    debug(`Using profile: ${profile}`);
    debug(`Path: ${path}`);
    const images = randomFilesFromPath(path, 10);

    const { first_name, last_name } = generateName(gender);
    const { day, month, year } = generateBirthday();

    const userInfo = {
      first_name,
      last_name,
      name: `${first_name} ${last_name}`,
      password: 'xxx123xxx',
      day,
      month,
      year,
      profileImage: images[0],
      shareToFeed: true,
      followRecommendedCount: 3,
    };
    debug(userInfo);

    await smsService.getBalance();
    await subscriptionService.balance();

    await openApp(client);
    await sleep(2000);

    // TODO test automator
    // if (chance.bool({ likelihood: 70 })) {
    //   debug(`Account Created: username=${chance.string({ length: 8, alpha: true })} ip=${ip}`);
    //   await sleep(10 * 1000);
    //   for (let count = 1; count <= total; count++) {
    //     debug(`Follow ${count}`);
    //     await sleep(1000);
    //   }
    //   throw new Error(`OK`);
    // } else {
    //   throw new Error(`challenge_required`);
    // }

    username = await signUp(client, userInfo, getPrefix, getPhoneNumber, getVerificationCode, confirmSMS);
    ip = await getIP(client);
    debug(`Account Created: username=${username} ip=${ip}`);
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

    const dizu = new DizuAPI();
    await updateBiography(client, dizu.getCode());
    await sleep(2000);

    const orderInfo = await subscriptionService.order(username);
    const orderId = orderInfo.order;

    let n = 1;
    for (let i = 0; i < 6; i++) {
      await addPost(client, i+1, images[n]);
      await sleep(60000);
      n++;
    }

    for (let i = 0; i < 3; i++) {
      await addStory(client, i+1, images[n], randomReelsTitle());
      await sleep(60000);
      n++;
    }

    const accountId = client.getUserId();

    const orderStatus = await subscriptionService.status(orderId);
    if (orderStatus.status !== 'Completed') {
      // await getInput(`Account ${username} is ready to be added to Dizu?`);
    }

    await dizu.addAccount(username);
    await sleep(15000);

    await updateBiography(client, getRandomBiography(gender));
    await sleep(2000);

    while (count < total) {
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
    debug(err);
    console.error(err);
  }

  debug(`Start: ${start.toLocaleTimeString()}`);
  debug(`End: ${new Date().toLocaleTimeString()}`);
  debug(`Username: ${username}`);
  debug(`Follows: ${count}`);
  debug(`Total: ${total}`);
  debug(`Country: ${country}`);
  debug(`IP: ${ip}`);
})();
