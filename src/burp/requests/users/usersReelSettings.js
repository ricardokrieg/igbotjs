const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:usersReelSettings');

  const response = await client.send({ url: `/api/v1/users/reel_settings/` });
  debug(response);

  return response;
};
