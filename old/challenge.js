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

(async () => {
  console.log('Simulating pre login flow...');
  await ig.simulate.preLoginFlow();

  let loggedInUser = null;

  await Bluebird.try(async () => {
    console.log('Logging in...');
    loggedInUser = await ig.account.login(username, password);
    console.log('Logged in:');
    console.log(loggedInUser);
  }).catch(IgCheckpointError, async () => {
    console.log('XXX 1');
    console.log(ig.state.checkpoint); // Checkpoint info here
    await ig.challenge.auto(true); // Requesting sms-code or click "It was me" button
    console.log('XXX 2');
    console.log(ig.state.checkpoint); // Challenge info here
    const { code } = await inquirer.prompt([
      {
        type: 'input',
        name: 'code',
        message: 'Enter code',
      },
    ]);
    console.log(await ig.challenge.sendSecurityCode(code));
  });

  console.log('Simulating post login flow...');
  process.nextTick(async () => await ig.simulate.postLoginFlow());

  console.log('Fetching user feed...');
  const userFeed = ig.feed.user(loggedInUser.pk);
  console.log('User feed:');
  console.log(userFeed);

  console.log('Fetching user feed items...');
  const myPostsFirstPage = await userFeed.items();
  const myPostsSecondPage = await userFeed.items();

  console.log('First Page:'); 
  console.log(myPostsFirstPage);
  console.log('Second Page:'); 
  console.log(myPostsSecondPage);

  console.log('End');
})();
