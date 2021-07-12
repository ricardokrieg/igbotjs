const { qeSyncExperiments } = require('../../settings');

const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:qeSync');

  const data = {
    id: client.getDeviceId(),
    server_config_retrieval: `1`,
    experiments: qeSyncExperiments,
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const headers = {
    'X-DEVICE-ID': client.getDeviceId(),
    ...client.headers(),
  };

  const response = await client.send({ url: `/api/v1/qe/sync/`, method: 'POST', form, headers });
  debug(response);

  return response;
};
