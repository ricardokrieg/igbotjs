const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:mediaBlocked');

  const response = await client.send({ url: `/api/v1/media/blocked/` });
  debug(response);

  return response;
};
