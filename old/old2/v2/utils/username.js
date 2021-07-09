const inquirer = require('inquirer');
const { random } = require('lodash');

const generateUsername = (username) => {
  while (username.match(/[RANDOM]/gim)) {
    const randomStr = random(0, 9999);
    username = username.replace('[RANDOM]', randomStr);
  }

  return username;
}

const inputUsername = async (username) => {
  return (await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Username',
    },
  ])).username;
}

module.exports = { generateUsername, inputUsername };