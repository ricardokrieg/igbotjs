const Bluebird = require('bluebird');
const _debug = require('debug');

const {
  dynamicOnboardingGetSteps,
  launcherSync,
  nuxNewAccountNuxSeen,
  pushRegister,
  qeSync,
  zrTokenResult,
} = require('../requests/generic');

const {
  multipleAccountsGetAccountFamily,
} = require('../requests/multipleAccounts');

const {
  accountsContactPointPrefill,
} = require('../requests/accounts');

const debug = _debug('bot:afterSignUp');

module.exports = async (client) => {
  debug(`Start`);

  let requests = [
    () => multipleAccountsGetAccountFamily(client),
    () => zrTokenResult(client),
    () => dynamicOnboardingGetSteps(client),
    () => launcherSync(client),
    () => qeSync(client),
    () => nuxNewAccountNuxSeen(client),
    () => accountsContactPointPrefill(client),
    () => pushRegister(client),
  ];

  await Bluebird.map(requests, request => request());

  debug(`End`);
};
