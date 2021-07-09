const _debug = require('debug');

const loomFetchConfig = async (client) => {
  const debug = _debug('bot:loomFetchConfig');

  const response = await client.send({ url: `/api/v1/loom/fetch_config/` });
  debug(response);

  return response;
};

module.exports = loomFetchConfig;
