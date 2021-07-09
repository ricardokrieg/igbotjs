const _debug = require('debug');

const fbsearchIgShopRecentSearches = async (client) => {
  const debug = _debug('bot:fbsearchIgShopRecentSearches');

  const response = await client.send({ url: `/api/v1/fbsearch/ig_shop_recent_searches/` });
  debug(response);

  return response;
};

module.exports = fbsearchIgShopRecentSearches;
