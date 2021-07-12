const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:zrTokenResult');

  const qs = {
    device_id: client.getAndroidId(),
    token_hash: '',
    custom_device_id: client.getDeviceId(),
    fetch_reason: `token_expired`,
  };

  const response = await client.send({ url: `/api/v1/zr/token/result/`, qs });
  debug(response);

  return response;
};
