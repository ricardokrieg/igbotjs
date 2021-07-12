const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:siFetchHeaders');

  const qs = {
    guid: client.getDeviceId().replace(/-/g, ''),
    challenge_type: `signup`,
  };

  const response = await client.send({ url: `/api/v1/si/fetch_headers/`, qs });
  debug(response);

  return response;
};
