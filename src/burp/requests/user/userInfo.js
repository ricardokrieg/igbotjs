const _debug = require('debug');

module.exports = async (client, userId, module = null) => {
  const debug = _debug('bot:userInfo');

  const qs = {
    from_module: module,
  };

  const response = await client.send({ url: `/api/v1/users/${userId}/info/`, qs });
  debug(response);

  return response;
};
