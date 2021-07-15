const _debug = require('debug');

module.exports = async (client, query, params = {}) => {
  const debug = _debug('bot:fbsearchTopsearchFlat');

  const rank_token = params.rank_token;
  const page_token = params.page_token;

  const qs = {
    search_surface: `top_search_page`,
    timezone_offset: 0,
    count: 30,
    query: query,
    context: `blended`,
    rank_token,
    page_token,
  };

  const response = await client.send({ url: `/api/v1/fbsearch/topsearch_flat/`, qs });
  debug(response);

  return response;
};
