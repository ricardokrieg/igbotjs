const _debug = require('debug');

const discoverChaining = async (client, userId) => {
  const debug = _debug('bot:discoverChaining');

  const qs = {
    module: `profile`,
    target_id: userId,
  };

  const response = await client.send({ url: `/api/v1/discover/chaining/`, qs });
  debug(response);

  return response;
};

module.exports = discoverChaining;
