const _debug = require('debug');

module.exports = async (client, username) => {
  const debug = _debug('bot:requests:usersCheckUsername');

  const data = {
    _uuid: client.getDeviceId(),
    username,
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const response = await client.send({ url: `/api/v1/users/check_username/`, method: 'POST', form });
  debug(response);

  return response;
};
