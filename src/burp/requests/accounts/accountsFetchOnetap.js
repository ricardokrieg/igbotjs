const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:accountsFetchOnetap');

  const data = {
    phone_id: client.getFamilyDeviceId(),
    _uid: client.getUserId(),
    guid: client.getDeviceId(),
    device_id: client.getAndroidId(),
    _uuid: client.getDeviceId(),
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const response = await client.send({ url: `/api/v1/accounts/fetch_onetap/`, method: 'POST', form });
  debug(response);

  return response;
};
