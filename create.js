import { IgApiClient } from 'instagram-private-api'
import { sample } from 'lodash'

const IG_USERNAME = 'xxxistotemqfuncionarok';
const IG_PASSWORD = 'xxx123xxx$$$';
const IG_EMAIL = 'naodesistaainda@gmail.com';
const IG_FIRST_NAME = 'Talvez Seja';

const ig = new IgApiClient();

console.log('Generating Device ID...');
ig.state.generateDevice(IG_USERNAME);

console.log(ig.state.uuid);
console.log(ig.state.deviceId);
console.log(ig.state.cookieCsrfToken);

/*
ig.state.proxyUrl = 'http://daenerys_insta:Pa$$word%402k19@alpha.mobileproxy.network:11727';

(async () => {
  console.log('Simulating Pre-Login Flow...');
  await ig.simulate.preLoginFlow();

  console.log('Creating Account...');
  const body = await ig.account.create({ username: IG_USERNAME, password: IG_PASSWORD, email: IG_EMAIL, first_name: IG_FIRST_NAME });

  console.log('XXX');
  console.log(body);
  console.log('XXX');
})();
*/

