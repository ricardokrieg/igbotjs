const _debug = require('debug');

const { upCaseHeaders } = require('../../utils');

module.exports = async (client) => {
  const debug = _debug('bot:launcherSync');

  let data;

  const userId = client.getUserId() || null;

  if (userId) {
    data = {
      id: `${userId}`,
      _uid: `${userId}`,
      _uuid: client.getDeviceId(),
      server_config_retrieval: `1`,
    };
  } else {
    data = {
      id: client.getDeviceId(),
      server_config_retrieval: `1`,
    };
  }

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const headers = upCaseHeaders(client.headers());

  const response = await client.send({ url: `/api/v1/launcher/sync/`, method: 'POST', form, headers });
  debug(response);

  return response;
};
