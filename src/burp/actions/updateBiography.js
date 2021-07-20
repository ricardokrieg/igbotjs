const Bluebird = require('bluebird');
const _debug = require('debug');

const {
  accountsContactPointPrefill,
  accountsSetBiography,
} = require('../requests/accounts');

const {
  fundraiserCanCreatePersonalFundraisers,
} = require('../requests/generic');

const debug = _debug('bot:actions:updateBiography');

module.exports = async (client, biography) => {
  debug(`Start`);
  debug(`Biography: ${biography}`);

  await accountsSetBiography(client, biography);

  let requests = [
    () => accountsContactPointPrefill(client, `prefill`),
    () => fundraiserCanCreatePersonalFundraisers(client),
  ];

  await Bluebird.map(requests, request => request());

  debug(`End`);
};
