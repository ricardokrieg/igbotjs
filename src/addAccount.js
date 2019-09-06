const { IgApiClient, IgCheckpointError } = require('instagram-private-api');
const Bluebird = require('bluebird');
const inquirer = require('inquirer');
const { MongoClient } = require('mongodb');

const { logger } = require('./utils');

const log = (message) => logger('AddAccount', message);


let username = null;
let accountsCol = null;

const ig = new IgApiClient();

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

  accountsCol.updateOne({ _id: username }, { $set: { cookies: cookies, state: state } });
});

async function connectToDatabase() {
  const client = new MongoClient('mongodb://wolf:xxx123xxx@ds243963.mlab.com:43963/igbotjs', { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  log('Connected to database');
  accountsCol = client.db('igbotjs').collection('accounts');
}

async function performLogin(username, password) {
  log('Logging in...');

  const auth = await ig.account.login(username, password);

  log('Logged in:');
  log(auth);

  log('Simulating post login flow...');
  await ig.simulate.postLoginFlow();

  log('Login done');
}

(async () => {
  await connectToDatabase();

  username = (await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Username',
    },
  ]))['username'];

  const accountDetails = await accountsCol.findOne({ _id: username });
  log(accountDetails);

  log('Username: ' + accountDetails._id);
  log('Password: ' + accountDetails.password);
  log('Proxy   : ' + accountDetails.proxy);

  ig.state.generateDevice(username);
  ig.state.proxyUrl = accountDetails.proxy;

  log('Simulating pre login flow...');
  await ig.simulate.preLoginFlow();

  Bluebird.try(async () => {
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
