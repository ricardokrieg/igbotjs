const inquirer = require('inquirer');
const {reject, isEmpty, map} = require('lodash');
const _debug = require('debug');
const chance = require('chance').Chance();
const request = require('request-promise');

const Client = require('../client');
const openApp = require("../actions/openApp");
const signUp = require("../actions/signUp");
const signUpCompleteProfile = require("../actions/signUpCompleteProfile");
const feedSignup = require("../actions/feedSignUp");
const visitSelfProfile = require("../actions/visitSelfProfile");
const visitEditProfile = require("../actions/visitEditProfile");
const updateBiography = require("../actions/updateBiography");
const editProfile = require("../actions/editProfile");
const addPost = require("../actions/addPost");
const addStory = require("../actions/addStory");
const search = require("../actions/search");
const SMSService = require('../SMSService');
const SubscriptionService = require('../SubscriptionService');
const {
  sleep,
  generateAttrs,
  generateName,
  generateBirthday,
  randomReelsTitle,
  getIP,
  getProxy,
  randomFilesFromPath,
} = require('../utils');
const {
  friendshipsCreate,
  friendshipsFollowers,
  friendshipsShowMany,
} = require('../requests/friendships');

const debug = _debug('bot:agenciagram');

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

const profileType = process.env.PROFILE_TYPE;
if (!profileType) {
  throw new Error(`PROFILE_TYPE is required`);
}
if (![`delphine1`, `belle.delphine_2021`].includes(profileType)) {
  throw new Error(`Invalid profileType: ${profileType}`);
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
  const gender = `female`;
  const biography = `Quer ser influencer no insta?\nClique e saiba como`
  const urls = [`https://bit.ly/3AVLi2L`, `https://bit.ly/3D47Ikj`];

  const country = process.env.COUNTRY || `RU`;
  debug(`Country: ${country}`);

  const proxy = getProxy(proxyIndex);
  debug(`Proxy: ${proxy.name}`);

  try {
    debug(`Start: ${start.toLocaleTimeString()}`);

    const attrs = generateAttrs(country);
    attrs.proxy = proxy.address;
    debug(attrs);

    const client = new Client(attrs);
    ip = await getIP(client);

    debug(`IP (start): ${ip}`);

    let profileImage;

    const path = `./res/images/${profileType}`;
    debug(`Using profile: ${profileType}`);
    debug(`Path: ${path}`);
    const images = randomFilesFromPath(`${path}/`, 10);

    if (profileType === `delphine1`) {
      profileImage = `${path}/profile.jpg`;
    } else {
      profileImage = images[0];
    }

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
      profileImage,
      shareToFeed: profileType !== `delphine1`,
      followRecommendedCount: 3,
    };
    debug(userInfo);

    await smsService.getBalance();
    await subscriptionService.balance();

    await openApp(client);
    await sleep(2000);

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

    await updateBiography(client, biography);
    await sleep(2000);

    const profileData = await visitEditProfile(client);
    await sleep(2000);

    let url;
    if (profileType === `delphine1`) {
      url = urls[0];
    } else {
      url = urls[1];
    }

    await editProfile(client, { ...profileData.user, external_url: url });
    await sleep(2000);

    // const orderInfo = await subscriptionService.order(username);
    // const orderId = orderInfo.order;

    if (profileType === `delphine1`) {
      await addPost(client, 1, `${path}/row-3-column-3.jpg`);
      await sleep(60000);

      await addPost(client, 2, `${path}/row-3-column-2.jpg`);
      await sleep(60000);

      await addPost(client, 3, `${path}/row-3-column-1.jpg`);
      await sleep(60000);

      await addPost(client, 4, `${path}/row-2-column-3.jpg`);
      await sleep(60000);

      await addPost(client, 5, `${path}/row-2-column-2.jpg`);
      await sleep(60000);

      await addPost(client, 6, `${path}/row-2-column-1.jpg`);
      await sleep(60000);

      await addPost(client, 7, `${path}/row-1-column-3.jpg`);
      await sleep(60000);

      await addPost(client, 8, `${path}/row-1-column-2.jpg`);
      await sleep(60000);

      await addPost(client, 9, `${path}/row-1-column-1.jpg`);
      await sleep(60000);
    } else {
      let n = 1;
      for (let i = 0; i < 8; i++) {
        await addPost(client, i+1, images[n]);
        await sleep(60000);
        n++;
      }
    }

    // await addStory(client, i+1, images[n], randomReelsTitle());
    // await sleep(60000);

    let sourceId;
    let targets = [];
    let nextMaxId = null;
    const rankToken = chance.guid();
    let lastFollow = -1;

    const { source } = await request({ url: 'http://localhost:3000/source', method: 'GET', json: true });

    try {
      debug(`Searching ${source}`);
      const {user} = await search(client, source, true, true);

      sourceId = user.pk;

      await sleep(5000);
    } catch (error) {
      debug(`Error when searching/following:`);
      debug(error);

      process.exit(1);
    }

    do {
      const response = await friendshipsFollowers(client, sourceId, rankToken, nextMaxId);
      await friendshipsShowMany(client, map(response.users, 'pk'));

      targets = reject(response.users, `has_anonymous_profile_picture`);
      nextMaxId = response.next_max_id;

      while (!isEmpty(targets)) {
        const user = targets.shift();

        const { blacklisted } = await request({ url: `http://localhost:3000/target/${user.username}`, method: 'GET', json: true });
        if (blacklisted) {
          debug(`${user.username} is blacklisted. Skipping.`);
          continue;
        }

        debug(`Follow #${count + 1}`);
        debug(`Following ${user.username}`);

        const delay = chance.integer({ min: 15000, max: 25000 });
        const waitTime = delay - (Date.now() - lastFollow);
        debug(`Wait ${waitTime / 1000} seconds`);
        if (waitTime > 0) {
          await sleep(waitTime);
        }

        await friendshipsCreate(client, user.pk);
        lastFollow = Date.now();
        count++;

        if (count >= total) {
          nextMaxId = null;
          break;
        }

        await sleep(10000);
      }
    } while (nextMaxId);
  } catch (err) {
    debug(err);
    console.error(err);
  }

  debug(`Country: ${country}`);
  debug(`IP: ${ip}`);
  debug(`Proxy: ${proxy.name}`);
  debug(`Username: ${username}`);
  debug(`Follows: ${count}`);
  debug(`Total: ${total}`);
  debug(`Start: ${start.toLocaleTimeString()}`);
  debug(`End: ${new Date().toLocaleTimeString()}`);
})();
