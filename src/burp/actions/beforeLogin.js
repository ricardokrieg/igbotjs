const _debug = require('debug');
const { shuffle } = require('lodash');
const Bluebird = require('bluebird');

const {
  accountsContactPointPrefill,
  accountsGetPrefillCandidates,
  launcherSync,
  qeSync,
} = require('../requests/generic');

const debug = _debug('bot:beforeLogin');

const afterLogin = async (client) => {
  debug(`Start`);

  let requests = shuffle([
    () => accountsContactPointPrefill(client),
    // () => accountsGetPrefillCandidates(client),
    // () => launcherSync(client),
    // () => qeSync(client),
  ]);

  await Bluebird.map(requests, request => request());

  debug(`End`);
};

module.exports = afterLogin;
