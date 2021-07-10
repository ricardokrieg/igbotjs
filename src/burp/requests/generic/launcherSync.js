const _debug = require('debug');

const launcherSync = async (client) => {
  const debug = _debug('bot:launcherSync');

  const data = {
    id: client.getDeviceId(),
    server_config_retrieval: 1,
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const response = await client.send({ url: `/api/v1/launcher/sync/`, method: 'POST', form });
  debug(response);

  return response;
};

module.exports = launcherSync;
