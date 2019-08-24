const Bot = require('./bot');

const username = 'charliespears302';
const proxy = 'http://daenerys_insta:alphaxxxpass123@alpha.mobileproxy.network:11727';
const sourceUsername = 'alinemonaretto';

(async () => {
  console.log('Start');

  await (new Bot(username, proxy)).start(sourceUsername);

  console.log('End');
})();
