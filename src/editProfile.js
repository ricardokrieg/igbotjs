const inquirer = require('inquirer');

const Bot = require('./bot');
const { logger, sleep } = require('./utils');

const log = (message) => logger('EditProfile', message);


(async () => {
  log('Start');

  const { username, newUsername, name, bio, url, profilePic } = (await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Username',
    },
    {
      type: 'input',
      name: 'newUsername',
      message: 'New Username',
    },
    {
      type: 'input',
      name: 'name',
      message: 'Full Name',
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
    {
      type: 'input',
      name: 'profilePic',
      message: 'Profile Pic',
    },
  ]));

  while(true) {
    try {
      await (new Bot({ username })).editProfile({ newUsername, name, bio, url, profilePic });
      break;
    } catch (e) {
      console.log(e);
    }

    console.log('Try again...');
    await sleep(20000);
  }

  log('End');
})();
