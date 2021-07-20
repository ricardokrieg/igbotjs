const _debug = require('debug');

module.exports = async (client, userId) => {
  const debug = _debug('bot:requests:friendshipsShow');

  const response = await client.send({ url: `/api/v1/friendships/show/${userId}/` });
  debug(response);

  return response;
};
