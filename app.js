import { IgApiClient } from 'instagram-private-api';
import { sample, forEach, filter } from 'lodash';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const username = process.env.IG_USERNAME;
const password = process.env.IG_PASSWORD;
const proxy = process.env.IG_PROXY || 'http://daenerys_insta:alphaxxxpass123@alpha.mobileproxy.network:11727'; 

console.log('Username: ' + username);
console.log('Password: ' + password);
console.log('Proxy   : ' + proxy);

const ig = new IgApiClient();

ig.state.generateDevice(username);
ig.state.proxyUrl = proxy;

const cookies = {"version":"tough-cookie@2.4.3","storeType":"MemoryCookieStore","rejectPublicSuffixes":true,"cookies":[{"key":"csrftoken","value":"aPZKGV5qBHHSfSUc3QFHgy5t5cgTFPIw","expires":"2020-08-20T02:45:28.000Z","maxAge":31449600,"domain":"instagram.com","path":"/","secure":true,"hostOnly":false,"creation":"2019-08-22T02:43:54.100Z","lastAccessed":"2019-08-22T02:45:29.123Z"},{"key":"rur","value":"PRN","domain":"instagram.com","path":"/","secure":true,"httpOnly":true,"hostOnly":false,"creation":"2019-08-22T02:43:54.105Z","lastAccessed":"2019-08-22T02:45:29.124Z"},{"key":"mid","value":"XV4BaQABAAGjldM-geK1OMt0QWkb","expires":"2029-08-19T02:43:53.000Z","maxAge":315360000,"domain":"instagram.com","path":"/","secure":true,"hostOnly":false,"creation":"2019-08-22T02:43:54.108Z","lastAccessed":"2019-08-22T02:45:26.485Z"},{"key":"ds_user","value":"_garotafit2019_","expires":"2019-11-20T02:44:18.000Z","maxAge":7776000,"domain":"instagram.com","path":"/","secure":true,"httpOnly":true,"hostOnly":false,"creation":"2019-08-22T02:44:19.232Z","lastAccessed":"2019-08-22T02:45:26.485Z"},{"key":"shbid","value":"2044","expires":"2019-08-29T02:44:18.000Z","maxAge":604800,"domain":"instagram.com","path":"/","secure":true,"httpOnly":true,"hostOnly":false,"creation":"2019-08-22T02:44:19.237Z","lastAccessed":"2019-08-22T02:45:26.485Z"},{"key":"shbts","value":"1566441858.7031229","expires":"2019-08-29T02:44:18.000Z","maxAge":604800,"domain":"instagram.com","path":"/","secure":true,"httpOnly":true,"hostOnly":false,"creation":"2019-08-22T02:44:19.239Z","lastAccessed":"2019-08-22T02:45:26.485Z"},{"key":"ds_user_id","value":"15991774973","expires":"2019-11-20T02:45:28.000Z","maxAge":7776000,"domain":"instagram.com","path":"/","secure":true,"hostOnly":false,"creation":"2019-08-22T02:44:19.242Z","lastAccessed":"2019-08-22T02:45:29.125Z"},{"key":"urlgen","value":"\"{\\\"223.24.154.163\\\": 132061}:1i0d6O:ASSd_QaSQnuLAlK7R5hx2FFr5fE\"","domain":"instagram.com","path":"/","secure":true,"httpOnly":true,"hostOnly":false,"creation":"2019-08-22T02:44:19.244Z","lastAccessed":"2019-08-22T02:45:29.127Z"},{"key":"sessionid","value":"15991774973%3ARSlOmHmMKr4uD2%3A22","expires":"2020-08-21T02:44:18.000Z","maxAge":31536000,"domain":"instagram.com","path":"/","secure":true,"httpOnly":true,"hostOnly":false,"creation":"2019-08-22T02:44:19.245Z","lastAccessed":"2019-08-22T02:45:26.485Z"},{"key":"is_starred_enabled","value":"yes","expires":"2029-08-19T02:44:52.000Z","maxAge":315360000,"domain":"instagram.com","path":"/","secure":true,"httpOnly":true,"hostOnly":false,"creation":"2019-08-22T02:44:52.874Z","lastAccessed":"2019-08-22T02:45:26.485Z"},{"key":"igfl","value":"_garotafit2019_","expires":"2019-08-23T02:44:52.000Z","maxAge":86400,"domain":"instagram.com","path":"/","secure":true,"httpOnly":true,"hostOnly":false,"creation":"2019-08-22T02:44:52.876Z","lastAccessed":"2019-08-22T02:45:26.485Z"}]};
const state = {
  deviceString: '26/8.0.0; 480dpi; 1080x2076; samsung; SM-A530F; jackpotlte; samsungexynos7885',
  deviceId: 'android-0d70e2e670ccdae8',
  uuid: '88ec575c-792e-5e7c-a6a4-f138da1e91c1',
  phoneId: '3a9c07c5-1aef-5f48-9195-f94f1d6de0d4',
  adid: '849a7121-b321-554f-bef5-5ba6eb17d2c0',
  build: 'N2G48C'
}

console.log('==> cookies');
console.log(JSON.stringify(cookies));
console.log('==> state');
console.log(state);

(async () => {
  console.log('Simulating pre login flow...');
  await ig.simulate.preLoginFlow();

  await ig.state.deserializeCookieJar(JSON.stringify(cookies));
  ig.state.deviceString = state.deviceString;
  ig.state.deviceId = state.deviceId;
  ig.state.uuid = state.uuid;
  ig.state.phoneId = state.phoneId;
  ig.state.adid = state.adid;
  ig.state.build = state.build;

  process.nextTick(async () => await ig.simulate.postLoginFlow());

  const auth = await ig.account.currentUser();

  console.log('Logged in:');
  console.log(auth);

  const source = await ig.user.searchExact('alinemonaretto');
  console.log('Source:');
  console.log(source);

  console.log(`Fetching ${source.username}'s followers...`);
  const followersFeed = ig.feed.accountFollowers(source.pk);
  const items = await followersFeed.items();
  console.log(`Fetched ${items.length} users to follow`);

  const validUsers = filter(items, { 'is_private': false, 'is_verified': false, 'has_anonymous_profile_picture': false }); 
  console.log(`Going to follow ${validUsers.length}`);

  for (const user of validUsers.slice(0, 10)) {
    await sleep(sample([5, 8, 10, 12, 15, 18, 20]) * 1000);
    console.log(`Following ${user.username}...`);
    console.log(await ig.user.info(user.pk));
    //ig.friendship.create(user.pk);
    console.log('Friendship status');
    console.log(await ig.friendship.showMany([user.pk]));
    console.log('done');
  }
})();
