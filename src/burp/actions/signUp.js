const _debug = require('debug');
const Bluebird = require('bluebird');

const {
  accountsCheckPhoneNumber,
  accountsCreateValidated,
  accountsSendSignupSmsCode,
  accountsUsernameSuggestions,
  accountsValidateSignupSmsCode,
} = require('../requests/accounts');

const {
  dynamicOnboardingGetSteps,
  siFetchHeaders,
} = require('../requests/generic');

const {
  consentCheckAgeEligibility,
  consentNewUserFlowBegins,
} = require('../requests/consent');

const { getRandomId } = require('../utils');

const debug = _debug('bot:signUp');

const signUp = async (client, prefix, phoneNumber) => {
  debug(`Start`);

  const waterfallId = getRandomId();
  const verificationCode = `123456`;
  const name = `S`;

  const day = 10;
  const month = 7;
  const year = 1999;

  const username = `sabujo2000aloha`;
  const password = `xxx123xxx`;

  let requests = [
    // () => accountsCheckPhoneNumber(client, phoneNumber),
    // () => accountsSendSignupSmsCode(client, prefix, phoneNumber, waterfallId),
    // () => accountsValidateSignupSmsCode(client, prefix, phoneNumber, verificationCode, waterfallId),
    // () => siFetchHeaders(client),
    // () => accountsUsernameSuggestions(client, name, waterfallId),
    // () => consentCheckAgeEligibility(client, day, month, year),
    // () => consentNewUserFlowBegins(client),
    // () => dynamicOnboardingGetSteps(client, waterfallId),
    () => accountsCreateValidated(client, prefix, phoneNumber, verificationCode, name, username, password, day, month, year, waterfallId),
  ];

  await Bluebird.map(requests, request => request(), { concurrency: 1 });

  debug(`End`);
};

module.exports = signUp;
