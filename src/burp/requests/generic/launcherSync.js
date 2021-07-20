const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:launcherSync');

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

  const response = await client.send({ url: `/api/v1/launcher/sync/`, method: 'POST', form });
  debug(response);

  return response;
};
