const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:fbsearchIgShopRecentSearches');

  let response;
  try {
    response = await client.send({ url: `/api/v1/fbsearch/ig_shop_recent_searches/` });
    debug(response);
  } catch (response) {
    if (response.status !== `fail` || response.message !== `Please wait a few minutes before you try again.`) {
      throw response;
    }
    debug(response);
  }

  return response;
};
