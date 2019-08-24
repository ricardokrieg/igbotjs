const { some, values } = require('lodash');


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function call(command) {
  let tries = 0;
  while (true) {
    try {
      tries++;

      command();

      break;
    } catch (err) {
      console.log(`Error: ${err}`);

      if (tries < 5) {
        sleep(5000);
      } else {
        throw err;
      }
    }
  }
}

call(() => { console.log('ok'); throw 'bug'; });

