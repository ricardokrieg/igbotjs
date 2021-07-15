const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:livePreLiveTools');

  const response = await client.send({ url: `/api/v1/live/pre_live_tools/` });
  debug(response);

  return response;
};
