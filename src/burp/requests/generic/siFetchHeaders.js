const _debug = require('debug');

const { upCaseHeaders } = require('../../utils');

module.exports = async (client) => {
  const debug = _debug('bot:siFetchHeaders');

  const qs = {
    guid: client.getDeviceId().replace(/-/g, ''),
    challenge_type: `signup`,
  };

  const headers = upCaseHeaders(client.headers());

  const response = await client.send({ url: `/api/v1/si/fetch_headers/`, qs, headers });
  debug(response);

  return response;
};
