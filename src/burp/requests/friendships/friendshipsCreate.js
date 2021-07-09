const _debug = require('debug');

const friendshipsCreate = async (client, userId) => {
  const debug = _debug('bot:friendshipsCreate');

  const data = {
    _csrftoken: client.csrfToken(),
    user_id: userId,
    radio_type: `wifi-none`,
    _uid: client.attrs.userId,
    device_id: client.attrs.deviceId,
    _uuid: client.attrs.uuid,
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`,
  };

  const response = await client.send({ url: `/api/v1/friendships/create/${userId}/`, method: 'POST', form });
  debug(response);

  return response;
};

module.exports = friendshipsCreate;
