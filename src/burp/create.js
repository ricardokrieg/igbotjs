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
  // const attrs = {
  //   proxy: 'http://192.168.15.30:8888',
  //   locale: `en_US`,
  //   language: `en-US`,
  //   country: `US`,
  //   timezoneOffset: 0,
  //   igWwwClaim: 0,
  //   phoneId: getRandomId(),
  //   uuid: getRandomId(),
  //   androidId: getRandomAndroidId(),
  //   mid: 0,
  //   familyDeviceId: getRandomId(),
  //   userAgent: `Instagram 187.0.0.32.120 Android (28/9; 320dpi; 720x1402; samsung; SM-A102U; a10e; exynos7885; en_US; 209143712)`,
  //   waterfallId: getRandomId(),
  // };

  const attrs = {
    proxy: 'http://192.168.15.30:8888',
    locale: 'en_US',
    language: 'en-US',
    country: 'US',
    timezoneOffset: 0,
    igWwwClaim: '0',
    phoneId: '27446d2d-cd1a-561a-9c3f-4a3b94351570',
    uuid: '02a4d948-51ec-5cb5-aa70-be7205ca8849',
    androidId: 'android-07b8802813cad25a',
    mid: 'YOwpuQABAAFVJZ-U8rxCA5kz-sPT',
    familyDeviceId: '4ef5d12f-0ab8-585f-aa9c-7870bbea561e',
    userAgent: 'Instagram 187.0.0.32.120 Android (28/9; 320dpi; 720x1402; samsung; SM-A102U; a10e; exynos7885; en_US; 209143712)',
    waterfallId: '255ffd50-8cd4-501c-a401-8a7c0175bf6d',
    directRegionHint: '',
    shbid: '',
    shbts: '',
    rur: '',
    userId: '',
    passwordEncryptionKeyId: '240',
    passwordEncryptionPubKey: 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF2T3dER3hTdmYrb3Q2aXpha2MzLwpXL2VTZzNoRzFZT2NGQXZMNzJNTFhiSURNTDhPR2oxY3BhZHFLTllLVmtseUVlZjRTa2E3dzk2dnkxTmRQVnhICkpDZHpZT0k2bWFNWHFoZnBscTdsbGV5SnRFZTJodHd2WVFRU2U2WTN2N0JOclBhNlY5NWdhM3FyYTV5MWtIZGUKN29JZXlDcERxNkxVb1ZZTlVROVM0ZGN2MW4yekllYSszMEtVTmxFdmJOdURBNDEvNFJHWkJuMEtaVkJ2UUZQQQpxY1diU0dtMGhqZnhDLzI2K2FBUVVvaHI5OFE3OFRISVBSV01pVzZ2MjR1R2lFR0tCRWRmZGFyOUdKMll5VmhEClhlWDZqTVFvZWtDSDE1SGY5SHY3WWRUSFhsVEJFcC8zT09BWG13MmNkNnE3VjJBMDg1SWRoOHVFWXRJV1I1VkcKYVFJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg=='
  };

  const client = new Client(attrs);

  const userInfo = {
    name: 'Awesome Sabujo',
    password: 'xxx123xxx',
    day: 12,
    month: 7,
    year: 1995,
  };

  // await beforeLogin(client);
  await signUp(client, userInfo, getPrefix, getPhoneNumber, getVerificationCode);
})();
