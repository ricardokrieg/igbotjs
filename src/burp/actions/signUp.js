const _debug = require('debug');
const {map} = require('lodash');

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

const debug = _debug('bot:actions:signUp');

module.exports = async (client, userInfo, getPrefix, getPhoneNumber, getVerificationCode, confirmSMS = null) => {
  debug(`Start`);

  const prefix = await getPrefix(client.getCountry());
  const phoneNumber = await getPhoneNumber(client.getCountry());

  debug(`Checking phone number: ${phoneNumber}`);
  await accountsCheckPhoneNumber(client, phoneNumber);
  debug(`Sending SMS code to ${prefix} ${phoneNumber}`);
  await accountsSendSignupSmsCode(client, prefix, phoneNumber);

  const verificationCode = await getVerificationCode(client.getCountry());
  if (confirmSMS) {
    await confirmSMS(client.getCountry());
  }

  debug(`Validating SMS Code: ${verificationCode}`);
  await accountsValidateSignupSmsCode(client, prefix, phoneNumber, verificationCode);

  await siFetchHeaders(client);

  let usernameSuggestions = await accountsUsernameSuggestions(client, userInfo.name);
  const usernames = map(usernameSuggestions.suggestions_with_metadata.suggestions, 'username');
  debug(`Username suggestions: ${usernames.join(', ')}`);

  const username = usernameSuggestions.suggestions_with_metadata.suggestions[0].username;

  await consentCheckAgeEligibility(client, userInfo.day, userInfo.month, userInfo.year);
  await consentNewUserFlowBegins(client);
  await dynamicOnboardingGetSteps(client);

  debug(`Creating account with username ${username}...`);
  await accountsCreateValidated(client, prefix, phoneNumber, verificationCode,
    userInfo.name, username, userInfo.password, userInfo.day, userInfo.month, userInfo.year);
  debug(`Success!`);

  debug(`End`);

  return Promise.resolve(username);
};
