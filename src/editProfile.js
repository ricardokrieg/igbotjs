const inquirer = require('inquirer');

const Bot = require('./bot');
const { logger, sleep } = require('./utils');

const log = (message) => logger('SetBio', message);


(async () => {
  log('Start');

  const { username, bio, url } = (await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Username',
    },
    {
      type: 'input',
      name: 'bio',
      message: 'Bio',
    },
    {
      type: 'input',
      name: 'url',
      message: 'URL',
    },
  ]));

  while(true) {
    try {
      await (new Bot({ username })).editProfile({ bio, url });
      break;
    } catch (e) {
      console.log(e);
    }

    console.log('Try again...');
    await sleep(20000);
  }

  log('End');
})();
