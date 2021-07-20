const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:directV2GetPresence');

  const response = await client.send({ url: `/api/v1/direct_v2/get_presence/` });
  debug(response);

  return response;
};
