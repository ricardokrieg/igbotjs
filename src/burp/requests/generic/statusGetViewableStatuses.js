const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:statusGetViewableStatuses');

  const qs = {
    include_authors: true,
  };

  const response = await client.send({ url: `/api/v1/status/get_viewable_statuses/`, qs });
  debug(response);

  return response;
};
