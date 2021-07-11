const inquirer = require('inquirer');

const Client = require('./client');
const signUp = require("./actions/signUp");
const beforeLogin = require("./actions/beforeLogin");
const {
  getRandomId,
  getRandomAndroidId,
} = require('./utils');

const getInput = async (message) => {
  const { input } = (await inquirer.prompt([
    {
      type: 'input',
      name: 'input',
      message,
    },
  ]));

  return input;
}

const getPrefix = async () => {
  return getInput('Prefix');
};

const getPhoneNumber = async () => {
  return getInput('Phone Number');
};

const getVerificationCode = async () => {
  return getInput('Verification Code');
};

(async () => {
  const attrs = {
    proxy: 'http://192.168.15.30:8888',
    locale: `en_US`,
    language: `en-US`,
    country: `US`,
    timezoneOffset: 0,
    igWwwClaim: 0,
    phoneId: getRandomId(),
    uuid: getRandomId(),
    androidId: getRandomAndroidId(),
    mid: 0,
    familyDeviceId: getRandomId(),
    userAgent: `Instagram 187.0.0.32.120 Android (26/8.0.0; 480dpi; 1080x1920; samsung; GT-I9500; ja3g; universal5410; en_US; 93117670)`,
    waterfallId: getRandomId(),
  };

  const client = new Client(attrs);

  const userInfo = {
    name: 'Sabujo Demais',
    password: 'xxx123xxx',
    day: 10,
    month: 7,
    year: 1999,
  };

  await beforeLogin(client);
  await signUp(client, userInfo, getPrefix, getPhoneNumber, getVerificationCode);
})();
