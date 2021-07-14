const Bluebird = require('bluebird');
const _debug = require('debug');

const {
  accountsContactPointPrefill,
  accountsCurrentUser,
} = require('../requests/accounts');

const {
  fundraiserCanCreatePersonalFundraisers,
} = require('../requests/generic');

const debug = _debug('bot:visitEditProfile');

module.exports = async (client) => {
  debug(`Start`);

  await accountsCurrentUser(client, true);

  let requests = [
    () => accountsContactPointPrefill(client, `prefill`),
    () => fundraiserCanCreatePersonalFundraisers(client),
  ];

  await Bluebird.map(requests, request => request());

  debug(`End`);
};
