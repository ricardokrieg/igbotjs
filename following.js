import { IgApiClient, IgCheckpointError } from 'instagram-private-api';
import Bluebird from 'bluebird';
import inquirer from 'inquirer';
import { sample } from 'lodash';

const username = process.env.IG_USERNAME;
const password = process.env.IG_PASSWORD;
const proxy = process.env.IG_PROXY || 'http://daenerys_insta:alphaxxxpass123@alpha.mobileproxy.network:11727'; 

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
  console.log(JSON.stringify(cookies));
  console.log('==> state');
  console.log(state);

  /*await ig.state.deserializeCookieJar(JSON.stringify(cookies));
  ig.state.deviceString = state.deviceString;
  ig.state.deviceId = state.deviceId;
  ig.state.uuid = state.uuid;
  ig.state.phoneId = state.phoneId;
  ig.state.adid = state.adid;
  ig.state.build = state.build;*/
});

(async () => {
  console.log('Simulating pre login flow...');
  await ig.simulate.preLoginFlow();

  const auth = await ig.account.login(username, password);
  process.nextTick(async () => await ig.simulate.postLoginFlow());

  console.log('Logged in:');
  console.log(auth);

  const source = (await ig.search.users('alinemonaretto'))[0];
  console.log('Source:');
  console.log(source);

  /*console.log(`Fetching ${source.username}'s followers`);
  const followersFeed = ig.feed.accountFollowers(source.pk);
  const items = await followersFeed.items();
  console.log(items);*/
})();
