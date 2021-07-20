const Bluebird = require('bluebird');
const _debug = require('debug');
const { readFile } = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(readFile);

const {
  dynamicOnboardingGetSteps,
  fbFbEntrypointInfo,
  launcherSync,
  nuxNewAccountNuxSeen,
  pushRegister,
  qeSync,
  zrTokenResult,
} = require('../requests/generic');

const {
  discoverAyml,
} = require('../requests/discover');

const {
  multipleAccountsGetAccountFamily,
} = require('../requests/multipleAccounts');

const {
  accountsChangeProfilePicture,
  accountsContactPointPrefill,
} = require('../requests/accounts');

const {
  followRecommended,
} = require('../requests/friendships');

const debug = _debug('bot:actions:signUpCompleteProfile');

module.exports = async (client, userInfo) => {
  debug(`Start`);

  let requests = [
    () => multipleAccountsGetAccountFamily(client),
    () => zrTokenResult(client),
    () => dynamicOnboardingGetSteps(client),
    () => launcherSync(client),
    () => qeSync(client),
    () => nuxNewAccountNuxSeen(client),
    () => accountsContactPointPrefill(client, `auto_confirmation`),
    () => pushRegister(client),
  ];

  await Bluebird.map(requests, request => request());

  if (userInfo.profileImage) {
    debug(`Loading photo from disk: ${userInfo.profileImage}`);
    const photo = await readFileAsync(userInfo.profileImage);

    requests = [
      () => fbFbEntrypointInfo(client),
      () => discoverAyml(client),
      () => accountsChangeProfilePicture(client, photo, userInfo.shareToFeed),
    ];

    await Bluebird.map(requests, request => request());
  }

  if (userInfo.followRecommendedCount && userInfo.followRecommendedCount > 0) {
    debug(`Following ${userInfo.followRecommendedCount} recommended`);
    await followRecommended(client, userInfo.followRecommendedCount);
  }

  debug(`End`);
};
