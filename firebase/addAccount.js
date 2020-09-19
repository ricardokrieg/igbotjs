const { IgApiClient, IgCheckpointError } = require('instagram-private-api');
const Bluebird = require('bluebird');
const inquirer = require('inquirer');
const firebase = require('firebase');
require('firebase/firestore');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://instagram-bot-js.firebaseio.com'
});
const firestore = admin.firestore();
const accountsColRef = firestore.collection('accounts');
const util = require('util');

const log = (object) => { console.log(util.inspect(object, false, null, true)); };

let username = null;

const ig = new IgApiClient();
let docRef;

ig.request.end$.subscribe(async () => {
  const cookies = await ig.state.serializeCookieJar();
  const state = {
    deviceString: ig.state.deviceString,
    deviceId: ig.state.deviceId,
    uuid: ig.state.uuid,
    phoneId: ig.state.phoneId,
    adid: ig.state.adid,
    build: ig.state.build,
  };

  docRef.set({ cookies, state }, { merge: true });
});

const performLogin = async (username, password) => {
  log('Logging in...');

  const auth = await ig.account.login(username, password);

  log('Logged in:');
  log(auth);

  log('Simulating post login flow...');
  await ig.simulate.postLoginFlow();

  log('Login done');
};

const getAccountDetails = async (username) => {
  docRef = await accountsColRef.doc(username);
  const snapshot = await docRef.get();

  if (!snapshot.exists) throw new Error(`Account ${username} not found`);

  const data = snapshot.data();
  return { username: docRef.id, ...data };
};

(async () => {
  username = (await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Username',
    },
  ]))['username'];

  const accountDetails = await getAccountDetails(username);

  log(accountDetails);

  ig.state.generateDevice(username);
  // ig.state.proxyUrl = accountDetails.proxy;

  log('Simulating pre login flow...');
  await ig.simulate.preLoginFlow();

  await Bluebird.try(async () => {
    await performLogin(username, accountDetails.password);
  }).catch(IgCheckpointError, async () => {
    log(ig.state.checkpoint);
    await ig.challenge.auto(true);
    log(ig.state.checkpoint);

    const { code } = await inquirer.prompt([
      {
        type: 'input',
        name: 'code',
        message: 'Enter code',
      },
    ]);
    log(`Sending code ${code}...`);

    log(await ig.challenge.sendSecurityCode(code));

    await performLogin(username, accountDetails.password);
  });

  log('Done');
})();
