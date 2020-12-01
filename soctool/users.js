const _debug = require('debug');

const usersUsernameInfo = async (client, username) => {
  const debug = _debug('bot:soctool:users:usernameInfo');

  const response = await client.send({ url: `/api/v1/users/${username}/usernameinfo/` });
  debug(response);

  return response;
};

const usersInfo = async (client, pk) => {
  const debug = _debug('bot:soctool:users:info');

  const response = await client.send({ url: `/api/v1/users/${pk}/info/` });
  debug(response);

  return response;
};

module.exports = {
  usersUsernameInfo,
  usersInfo,
};