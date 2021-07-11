const Bluebird = require('bluebird');
const _debug = require('debug');

const {
  launcherSync,
  nuxNewAccountNuxSeen,
  zrTokenResult,
} = require('../requests/generic');

const debug = _debug('bot:afterSignUp');

module.exports = async (client) => {
  debug(`Start`);

  let requests = [
    // () => launcherSync(client),
    // () => zrTokenResult(client),
    () => nuxNewAccountNuxSeen(client),
  ];

  await Bluebird.map(requests, request => request());

  debug(`End`);
};
