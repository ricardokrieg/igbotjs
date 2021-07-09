const _debug = require('debug');

const friendshipsShow = async (client, userId) => {
  const debug = _debug('bot:friendshipsShow');

  const response = await client.send({ url: `/api/v1/friendships/show/${userId}/` });
  debug(response);

  return response;
};

module.exports = friendshipsShow;
