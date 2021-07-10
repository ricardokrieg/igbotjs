const _debug = require('debug');
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

  let requests = [
    () => accountsContactPointPrefill(client),
    () => qeSync(client),
    () => launcherSync(client),
    () => accountsGetPrefillCandidates(client),
  ];

  await Bluebird.map(requests, request => request(), { concurrency: 1 });

  debug(`End`);
};

module.exports = afterLogin;
