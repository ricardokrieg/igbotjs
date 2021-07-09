const _debug = require('debug');

const directV2GetPresence = async (client) => {
  const debug = _debug('bot:directV2GetPresence');

  const response = await client.send({ url: `/api/v1/direct_v2/get_presence/` });
  debug(response);

  return response;
};

module.exports = directV2GetPresence;
