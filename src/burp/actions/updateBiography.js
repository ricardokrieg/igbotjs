const Bluebird = require('bluebird');
const _debug = require('debug');

const {
  accountsContactPointPrefill,
  accountsSetBiography,
} = require('../requests/accounts');

const {
  fundraiserCanCreatePersonalFundraisers,
} = require('../requests/generic');

const debug = _debug('bot:updateBiography');

module.exports = async (client, biography) => {
  debug(`Start`);

  await accountsSetBiography(client, biography);

  let requests = [
    () => accountsContactPointPrefill(client, `prefill`),
    () => fundraiserCanCreatePersonalFundraisers(client),
  ];

  await Bluebird.map(requests, request => request());

  debug(`End`);
};
