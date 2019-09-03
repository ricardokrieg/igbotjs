const Bot = require('./bot');
const logger = require('./utils').logger;

const log = (message) => logger('Inbox', message);


(async () => {
  log('Start');

  while(true) {
    try {
      await (new Bot({ username: 'charliespears302' })).checkInbox();
      break;
    } catch (e) {
      console.log(e);
    }

    console.log('Try again...');
  }

  log('End');
})();
