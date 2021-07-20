const Bluebird = require('bluebird');
const _debug = require('debug');

const {
  fbsearchRegisterRecentSearchClick,
} = require('../requests/search');

const {
  friendshipsShow,
  friendshipsCreate,
} = require('../requests/friendships');

const {
  feedUser,
  feedUserStory,
} = require('../requests/feed');

const {
  highlightsHighlightsTray,
} = require('../requests/highlights');

const {
  multipleAccountsGetFeaturedAccounts,
} = require('../requests/multipleAccounts');

const {
  userInfo,
} = require('../requests/user');

const debug = _debug('bot:actions:follow');

module.exports = async (client, user) => {
  debug(`Start`);

  const userId = user.pk;
  debug(`UserID: ${userId}`);

  let requests = [
    () => fbsearchRegisterRecentSearchClick(client, userId),
    () => friendshipsShow(client, userId),
    () => feedUser(client, userId),
    () => feedUserStory(client, userId),
    () => highlightsHighlightsTray(client, userId),
    () => multipleAccountsGetFeaturedAccounts(client, userId),
    () => userInfo(client, userId),
  ];

  await Bluebird.map(requests, request => request());

  debug(`Following ${userId}`);
  await friendshipsCreate(client, userId);

  debug(`End`);
};
