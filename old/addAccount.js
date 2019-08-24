import { IgApiClient, IgCheckpointError } from 'instagram-private-api';
import Bluebird from 'bluebird';
import inquirer from 'inquirer';


const username = 'charliespears302';
const password = 'MaxSmithM';
const proxy = 'http://daenerys_insta:alphaxxxpass123@alpha.mobileproxy.network:11727';

console.log('Username: ' + username);
console.log('Password: ' + password);
console.log('Proxy   : ' + proxy);

const ig = new IgApiClient();

ig.state.generateDevice(username);
ig.state.proxyUrl = proxy;

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

  console.log('==> cookies');
  console.log(cookies);
  console.log('==> state');
  console.log(state);
});

async function performLogin() {
  console.log('Logging in...');

  const auth = await ig.account.login(username, password);

  console.log('Logged in:');
  console.log(auth);

  console.log('Simulating post login flow...');
  process.nextTick(async () => await ig.simulate.postLoginFlow());

  const userFeed = ig.feed.user(auth.pk);
  await userFeed.items();

  console.log('Login done');
}

(async () => {
  console.log('Simulating pre login flow...');
  await ig.simulate.preLoginFlow();

  Bluebird.try(async () => {
    await performLogin();
  }).catch(IgCheckpointError, async () => {
    console.log(ig.state.checkpoint);
    await ig.challenge.auto(true);
    console.log(ig.state.checkpoint);

    const { code } = await inquirer.prompt([
      {
        type: 'input',
        name: 'code',
        message: 'Enter code',
      },
    ]);

    console.log(await ig.challenge.sendSecurityCode(code));

    await performLogin();
  });

  console.log('Done');
})();
