const {
  qeSyncExperiments,
  qeSyncExperimentsLoggedIn,
} = require('../../settings');

const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:qeSync');

  let data;
  const userId = client.getUserId() || null;

  if (userId) {
    data = {
      id: `${userId}`,
      _uid: `${userId}`,
      _uuid: client.getDeviceId(),
      server_config_retrieval: `1`,
      experiments: qeSyncExperimentsLoggedIn,
    };
  } else {
    data = {
      id: client.getDeviceId(),
      server_config_retrieval: `1`,
      experiments: qeSyncExperiments,
    };
  }

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
