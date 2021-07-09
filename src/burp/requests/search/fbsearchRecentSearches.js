const _debug = require('debug');

const fbsearchRecentSearches = async (client) => {
  const debug = _debug('bot:fbsearchRecentSearches');

  const response = await client.send({ url: `/api/v1/fbsearch/recent_searches/` });
  debug(response);

  return response;
};

module.exports = fbsearchRecentSearches;
