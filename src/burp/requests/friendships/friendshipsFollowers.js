const _debug = require('debug');

module.exports = async (client, userId, rankToken, maxId) => {
  const debug = _debug('bot:requests:friendshipsFollowers');

  const qs = {
    search_surface: `follow_list_page`,
    query: null,
    enable_groups: true,
    rank_token: rankToken,
  };

  if (maxId) {
    qs.max_id = maxId;
  }

  const response = await client.send({ url: `/api/v1/friendships/${userId}/followers/`, qs });
  debug(response);

  return response;
};

