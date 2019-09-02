const Bot = require('./bot');
const logger = require('./utils').logger;

const log = (message) => logger('Inbox', message);

const username = 'charliespears302';
const proxy = 'http://daenerys_insta:alphaxxxpass123@alpha.mobileproxy.network:11727';

(async () => {
  log('Start');

  while(true) {
    try {
      await (new Bot(username, proxy)).checkInbox();
      break;
    } catch (e) {
      console.log(e);
    }

    console.log('Try again...');
  }

  log('End');
})();
