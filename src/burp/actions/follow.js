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

const debug = _debug('bot:follow');

module.exports = async (client, user) => {
  debug(`Start`);

  const userId = user.pk;

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

  await friendshipsCreate(client, userId);

  debug(`End`);
};
