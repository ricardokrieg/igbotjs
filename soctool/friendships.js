const _debug = require('debug');

const { sign } = require('./utils');

const friendshipsCreate = async (client, pk) => {
  const debug = _debug('bot:soctool:friendships:create');

  const form = {
    signed_body: sign({
      _csrftoken: client.attrs.token,
      user_id: pk,
      radio_type: 'wifi-none',
      _uid: client.attrs.userId,
      device_id: client.attrs.deviceId,
      _uuid: client.attrs.uuid,
    }),
  };

  const response = await client.send({ url: `/api/v1/friendships/create/${pk}/`, method: `POST`, form });
  debug(response);

  if (response.spam || response.message === 'challenge_required' || response.status === 'fail') {
    throw new Error(response.message);
  }

  return response;
};

module.exports = {
  friendshipsCreate
};
