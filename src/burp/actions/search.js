const Bluebird = require('bluebird');
const _debug = require('debug');
const {shuffle, get} = require('lodash');

const {
  commerceDestinationPrefetchEligible,
} = require('../requests/generic');

const {
  fbsearchNullstateDynamicSections,
  fbsearchRecentSearches,
  fbsearchIgShopRecentSearches,
  fbsearchTopsearchFlat,
} = require('../requests/search');

const debug = _debug('bot:actions:search');

module.exports = async (client, query, stopOnTarget = true, isFirstSearch = false) => {
  debug(`Start`);

  let requests = [
    () => fbsearchNullstateDynamicSections(client),
    () => commerceDestinationPrefetchEligible(client),
  ];

  if (isFirstSearch) {
    requests = [
      ...requests,
      () => fbsearchRecentSearches(client),
      () => fbsearchIgShopRecentSearches(client),
    ];
  }

  await Bluebird.map(shuffle(requests), request => request());

  let searchResults = { has_more: false };
  let params = {};
  do {
    searchResults = await fbsearchTopsearchFlat(client, query, params);

    for (let item of searchResults.list) {
      const username = get(item, 'user.username');
      const itemUserId = get(item, 'user.pk');
      const isPrivate = get(item, 'user.is_private');
      const following = get(item, 'user.friendship_status.following');

      if (!username || !itemUserId) {
        continue;
      }

      debug(`#${item.position} => ${username} (private? ${isPrivate}) (following? ${following})`);

      if (stopOnTarget && username.toLowerCase() === query.toLowerCase()) {
        return Promise.resolve({ user: item.user, is_private: isPrivate, following });
      }
    }

    if (stopOnTarget) {
      return Promise.reject(new Error(`${query} not found`));
    }

    params = {
      rank_token: searchResults.rank_token,
      page_token: searchResults.page_token,
    };
  } while (searchResults.has_more);
};
