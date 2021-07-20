const _debug = require('debug');

module.exports = async (client, userId) => {
  const debug = _debug('bot:requests:friendshipsCreate');

  const data = {
    // _csrftoken: client.csrfToken(),
    user_id: `${userId}`,
    radio_type: `wifi-none`,
    _uid: client.getUserId(),
    device_id: client.getAndroidId(),
    _uuid: client.getDeviceId(),
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`,
  };

  const response = await client.send({ url: `/api/v1/friendships/create/${userId}/`, method: 'POST', form });
  debug(response);

  return response;
};
