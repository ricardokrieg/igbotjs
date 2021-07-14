const _debug = require('debug');

module.exports = async (client, biography) => {
  const debug = _debug('bot:accountsSetBiography');

  const data = {
    _uid: client.getUserId(),
    device_id: client.getAndroidId(),
    _uuid: client.getDeviceId(),
    raw_text: biography,
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const response = await client.send({ url: `/api/v1/accounts/set_biography/`, method: 'POST', form });
  debug(response);

  return response;
};
