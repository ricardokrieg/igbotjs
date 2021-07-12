const _debug = require('debug');

const {
  accountsContactPointPrefill,
  accountsGetPrefillCandidates,
} = require('../requests/accounts');

const {
  launcherSync,
  qeSync,
} = require('../requests/generic');

const debug = _debug('bot:beforeLogin');

const beforeLogin = async (client) => {
  debug(`Start`);

  await accountsContactPointPrefill(client);
  await launcherSync(client);
  await qeSync(client);
  await accountsGetPrefillCandidates(client);

  debug(`End`);
};

module.exports = beforeLogin;
