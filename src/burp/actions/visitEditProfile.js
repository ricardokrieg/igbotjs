const Bluebird = require('bluebird');
const _debug = require('debug');

const {
  accountsContactPointPrefill,
  accountsCurrentUser,
} = require('../requests/accounts');

const {
  fundraiserCanCreatePersonalFundraisers,
} = require('../requests/generic');

const debug = _debug('bot:actions:visitEditProfile');

module.exports = async (client) => {
  debug(`Start`);

  const response = await accountsCurrentUser(client, true);

  let requests = [
    () => accountsContactPointPrefill(client, `prefill`),
    () => fundraiserCanCreatePersonalFundraisers(client),
  ];

  await Bluebird.map(requests, request => request());

  debug(`End`);

  return response;
};
