const _debug = require('debug');
const {map, filter, isEmpty} = require('lodash');

const {generateUsernames, sleep} = require('../utils');

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

const {
  usersCheckUsername,
} = require('../requests/users');

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

  const usernameSuggestions = await accountsUsernameSuggestions(client, userInfo.name);
  const usernames = map(usernameSuggestions.suggestions_with_metadata.suggestions, 'username');
  debug(`Username suggestions: ${usernames.join(', ')}`);

  let username;
  const validUsernames = filter(usernames, (username) => !/\d/.exec(username));
  debug(`Valid Usernames: ${validUsernames}`);

  if (!isEmpty(validUsernames)) {
    username = validUsernames[0];
  } else {
    const customUsernames = generateUsernames(userInfo.first_name, userInfo.last_name);
    for (let customUsername of customUsernames) {
      debug(`Checking username: ${customUsername}`);
      const { available, existing_user_password, status } = await usersCheckUsername(client, customUsername);

      if (status === 'ok' && !existing_user_password && available) {
        username = customUsername;
        break;
      }

      await sleep(2000);
    }
  }

  if (!username) {
    username = usernames[0];
  }

  debug(`Username: ${username}`);

  await consentCheckAgeEligibility(client, userInfo.day, userInfo.month, userInfo.year);
  await consentNewUserFlowBegins(client);
  await dynamicOnboardingGetSteps(client);

  debug(`Creating account with username ${username}...`);
  await accountsCreateValidated(client, prefix, phoneNumber, verificationCode,
    userInfo.name, username, userInfo.password, userInfo.day, userInfo.month, userInfo.year);
  debug(`Success! ${username}`);

  debug(`End`);

  return Promise.resolve(username);
};
