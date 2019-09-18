const inquirer = require('inquirer');

const Bot = require('./bot');
const { logger, sleep } = require('./utils');

const log = (message) => logger('Comment', message);


(async () => {
  log('Start');

  const { username } = (await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Username',
    },
  ]));

  while(true) {
    try {
      await (new Bot({ username })).comment();
      break;
    } catch (e) {
      console.log(e);
    }

    console.log('Try again...');
    await sleep(20000);
  }

  log('End');
})();
