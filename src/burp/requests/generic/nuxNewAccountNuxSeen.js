const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:nuxNewAccountNuxSeen');

  const data = {
    is_fb4a_installed: `false`,
    phone_id: client.getFamilyDeviceId(),
    _uid: client.getUserId(),
    guid: client.getDeviceId(),
    device_id: client.getAndroidId(),
    _uuid: client.getDeviceId(),
    waterfall_id: client.getWaterfallId(),
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const response = await client.send({ url: `/api/v1/nux/new_account_nux_seen/`, method: 'POST', form });
  debug(response);

  return response;
};
