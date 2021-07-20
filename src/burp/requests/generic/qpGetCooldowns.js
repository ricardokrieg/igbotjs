const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:qpGetCooldowns');

  const qs = {
    signed_body: `SIGNATURE.{}`,
  };

  const response = await client.send({ url: `/api/v1/qp/get_cooldowns/`, qs });
  debug(response);

  return response;
};
