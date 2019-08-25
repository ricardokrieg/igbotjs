const Bot = require('./bot');

const username = 'charliespears302';
const proxy = 'http://daenerys_insta:alphaxxxpass123@alpha.mobileproxy.network:11727';
const sourceUsername = 'alinemonaretto';
// const sourceUsername = 'ronald.r1985';
const follows = 10;

(async () => {
  console.log('Start');

  await (new Bot(username, proxy)).doFollow(follows);

  console.log('End');
})();

// (async () => {
//   console.log('Start');
//
//   await (new Bot(username, proxy)).inbox();
//
//   console.log('End');
// })();

// (async () => {
//   console.log('Start');
//
//   await (new Bot(username, proxy)).followers();
//
//   console.log('End');
// })();

// (async () => {
//   console.log('Start');
//
//   await (new Bot(username, proxy)).sendMessage('amailtoalves', 'oi');
//
//   console.log('End');
// })();

// (async () => {
//   console.log('Start');
//
//   await (new Bot(username, proxy)).scrape(sourceUsername, 1000);
//
//   console.log('End');
// })();
