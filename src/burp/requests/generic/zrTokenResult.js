const _debug = require('debug');
const {upCaseHeaders} = require("../../utils");

module.exports = async (client) => {
  const debug = _debug('bot:zrTokenResult');

  const qs = {
    device_id: client.getAndroidId(),
    token_hash: '',
    custom_device_id: client.getDeviceId(),
    fetch_reason: `token_expired`,
  };

  const headers = upCaseHeaders(client.headers());

  const response = await client.send({ url: `/api/v1/zr/token/result/`, qs, headers });
  debug(response);

  return response;
};
