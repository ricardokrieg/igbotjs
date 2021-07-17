const inquirer = require('inquirer');
const _debug = require('debug');

const Client = require('../client');
const openApp = require("../actions/openApp");
const signUp = require("../actions/signUp");
const signUpCompleteProfile = require("../actions/signUpCompleteProfile");
const feedSignup = require("../actions/feedSignup");
const visitSelfProfile = require("../actions/visitSelfProfile");
const visitEditProfile = require("../actions/visitEditProfile");
const updateBiography = require("../actions/updateBiography");
const addPost = require("../actions/addPost");
const addStory = require("../actions/addStory");
const search = require("../actions/search");
const follow = require("../actions/follow");
const DizuAPI = require('../DizuAPI');
const {sleep, getRandomId, getRandomAndroidId, randomFilesFromPath} = require('../utils');

const debug = _debug('bot:dizu');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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

const getPrefix = async () => {
  return getInput('Prefix');
};

const getPhoneNumber = async () => {
  return getInput('Phone Number');
};

const getVerificationCode = async () => {
  return getInput('Verification Code');
};

(async () => {
  const attrs = {
    // proxy: 'http://192.168.15.30:8888',
    proxy: 'http://44.192.59.89:8888',
    locale: `en_US`,
    // locale: `pt_BR`,
    language: `en-US`,
    // language: `pt-BR`,
    country: `US`,
    // country: `BR`,
    timezoneOffset: 0,
    // timezoneOffset: String(new Date().getTimezoneOffset() * -60),
    igWwwClaim: 0,
    phoneId: getRandomId(),
    uuid: getRandomId(),
    androidId: getRandomAndroidId(),
    mid: 0,
    familyDeviceId: getRandomId(),
    // userAgent: `Instagram 187.0.0.32.120 Android (26/8.0.0; 480dpi; 1080x1920; samsung; GT-I9500; ja3g; universal5410; en_US; 93117670)`,
    userAgent: `Instagram 187.0.0.32.120 Android (21/5.0.1; 480dpi; 1080x1920; samsung; SAMSUNG-SGH-I537; jactivelteatt; qcom; en_US; 100986894)`,
    waterfallId: getRandomId(),
  };

  // const attrs = {
  //   proxy: 'http://192.168.15.30:8888',
  //   locale: 'en_US',
  //   language: 'en-US',
  //   country: 'US',
  //   timezoneOffset: 0,
  //   igWwwClaim: 'hmac.AR2QppB3QwxyooaoxRNrWooOJZ_x1ZydzvzxnhtgGyjBs86w',
  //   phoneId: 'c631a0df-6eb9-531f-967a-872b86394c17',
  //   uuid: 'eb38fdf1-601f-590c-b04e-22ae10ba3fec',
  //   androidId: 'android-51dfc1b885bdcdae',
  //   mid: 'YPI9rwABAAGvI_ospmc04yiaNO92',
  //   familyDeviceId: '4378bef9-2263-58dd-8020-f29f8172cded',
  //   userAgent: 'Instagram 187.0.0.32.120 Android (21/5.0.1; 480dpi; 1080x1920; samsung; SAMSUNG-SGH-I537; jactivelteatt; qcom; en_US; 100986894)',
  //   waterfallId: '2ee82c60-eee0-54e2-8e87-27245912ec02',
  //   directRegionHint: '',
  //   shbid: '',
  //   shbts: '',
  //   rur: 'RVA,48825104444,1658025181:01f7d75d44b812a04cb3f91a0a78bdbf8801be2a51d617b41d71ad02a30bd835e1557ddc',
  //   userId: '48825104444',
  //   passwordEncryptionKeyId: '236',
  //   passwordEncryptionPubKey: 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUFxcnF6alZsUC9PSTNIS1hPcDBOOApmOXRoTmtRZ2QyNEZ5T1FTdytIQUtvakpIaEVzWXJzWmQ2VSt3SmgyVjRrNnFCbVF5UksxTDlhY3dUL05aQlplCmtwU1EzNjZzRTNUR0s4RGUwQ1VNdHl1NC91cU1JMW5icjE1N3R5aEhKQkhXNnNTYlZCam94YWRWMU1lcDBMcEgKb1daWUZzQkFhYkkwR2g4MDlQZS84UGhZQVppQ3F5TXgwc08rV0FXSXZIN1ptWi9yQTFha2dIUWtzQWVtWkJ5TAo1Sm8wenI1R0JzRkl5bTRkQlZsanJ4SkJ1cjdDdVIzQnc2ZDBqS2ZXVTFKcHN2dE1CQUhSTG1ld3FzTmErSU8xClYxMUI3MyszNW9UK3dONERsNHBqS2ZZRDlYdUpoeFBackZjcWZLWG9tZUpiL3RYSm9GdEN5a3R1cmpUdWJNRmgKVXdJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==',
  //   authorization: 'Bearer IGT:2:eyJkc191c2VyX2lkIjoiNDg4MjUxMDQ0NDQiLCJzZXNzaW9uaWQiOiI0ODgyNTEwNDQ0NCUzQU5CU0FXNURuUUMwbUZWJTNBMTEiLCJzaG91bGRfdXNlX2hlYWRlcl9vdmVyX2Nvb2tpZXMiOnRydWV9',
  //   username: 'gabrielagarcia9565'
  // };

  const client = new Client(attrs);
  const images = randomFilesFromPath(`/Users/wolf/Downloads/cats/fitchicksinworkoutgear/`, 10);

  const userInfo = {
    name: 'Gabriela Garcia',
    password: 'xxx123xxx',
    day: 10,
    month: 7,
    year: 1999,
    profileImage: images[0],
    shareToFeed: true,
    followRecommendedCount: 3,
  };

  await openApp(client);
  await sleep(2000);

  const username = await signUp(client, userInfo, getPrefix, getPhoneNumber, getVerificationCode);
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

  await addPost(client, images[1]);
  await sleep(60000);
  await addPost(client, images[2]);
  await sleep(60000);
  await addPost(client, images[3]);
  await sleep(60000);
  await addPost(client, images[4]);
  await sleep(60000);
  await addPost(client, images[5]);
  await sleep(60000);
  await addPost(client, images[6]);
  await sleep(60000);

  await addStory(client, images[7], `1`);
  await sleep(60000);
  await addStory(client, images[8], `2`);
  await sleep(60000);
  await addStory(client, images[9], `3`);
  await sleep(60000);

  const accountId = client.getUserId();
  const dizu = new DizuAPI();

  await getInput(`Account ${username} is ready to be added to Dizu?`);
  await dizu.addAccount(username);
  await sleep(30000);

  let count = 0;
  while (count < 6000) {
    debug(`Follow #${count+1}`);

    const data = await dizu.getTask(accountId);

    if (data === null) {
      debug(`Got invalid task from Dizu`);
      continue;
    }

    debug(data);

    try {
      debug(`Searching ${data.username}`);
      const { user, is_private, following } = await search(client, data.username);

      if (!is_private && !following) {
        debug(`Following ${data.username}`);
        await follow(client, user);
        const result = await dizu.submitTask(data.connectFormId, accountId);
        debug(result);
        count++;

        await sleep(10000);
      } else {
        debug(`Skipped ${data.username} isPrivate=${is_private} following=${following}`);
      }
    } catch (error) {
      debug(error);

      if (error.message === 'challenge_required' || error.message === 'feedback_required') {
        break;
      }
    }
  }
})();
