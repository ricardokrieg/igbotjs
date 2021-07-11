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

const signUp = async (client, userInfo, getPrefix, getPhoneNumber, getVerificationCode) => {
  debug(`Start`);

  const prefix = await getPrefix();
  const phoneNumber = await getPhoneNumber();

  await accountsCheckPhoneNumber(client, phoneNumber);
  await accountsSendSignupSmsCode(client, prefix, phoneNumber);

  const verificationCode = await getVerificationCode();

  await accountsValidateSignupSmsCode(client, prefix, phoneNumber, verificationCode);

  await siFetchHeaders(client);
  const usernameSuggestions = await accountsUsernameSuggestions(client, userInfo.name);

  const username = usernameSuggestions.suggestions_with_metadata.suggestions[0].username;

  await consentCheckAgeEligibility(client, userInfo.day, userInfo.month, userInfo.year);
  await consentNewUserFlowBegins(client);
  await dynamicOnboardingGetSteps(client);

  await accountsCreateValidated(client, prefix, phoneNumber, verificationCode,
    userInfo.name, username, userInfo.password, userInfo.day, userInfo.month, userInfo.year);

  debug(`End`);
};

module.exports = signUp;
