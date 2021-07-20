const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:usersReelSettings');

  const response = await client.send({ url: `/api/v1/users/reel_settings/` });
  debug(response);

  return response;
};
