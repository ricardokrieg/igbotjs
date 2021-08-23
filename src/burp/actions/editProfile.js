const _debug = require('debug');

const {
  accountsEditProfile,
} = require('../requests/accounts');

const debug = _debug('bot:actions:editProfile');

module.exports = async (client, profileData) => {
  debug(`Start`);
  debug(`Profile Data: ${JSON.stringify(profileData)}`);

  await accountsEditProfile(client, profileData);

  debug(`End`);
};
