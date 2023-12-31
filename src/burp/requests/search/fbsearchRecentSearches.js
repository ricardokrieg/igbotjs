const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:fbsearchRecentSearches');

  let response;
  try {
    response = await client.send({ url: `/api/v1/fbsearch/recent_searches/` });
    debug(response);
  } catch (response) {
    if (response.status !== `fail`) {
      throw response;
    }
    debug(response);
  }

  return response;
};
