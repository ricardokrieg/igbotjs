const { qeSyncExperiments } = require('../../settings');

const _debug = require('debug');

const qeSync = async (client) => {
  const debug = _debug('bot:qeSync');

  const data = {
    id: client.getDeviceId(),
    server_config_retrieval: 1,
    experiments: qeSyncExperiments,
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const response = await client.send({ url: `/api/v1/qe/sync/`, method: 'POST', form });
  debug(response);

  return response;
};

module.exports = qeSync;
