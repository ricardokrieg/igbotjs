const Bot = require('./bot');

const username = 'charliespears302';
const proxy = 'http://daenerys_insta:alphaxxxpass123@alpha.mobileproxy.network:11727';
const sourceUsername = 'alinemonaretto';
const follows = 15;

(async () => {
  console.log('Start');

  await (new Bot(username, proxy)).start(sourceUsername, follows);

  console.log('End');
})();
