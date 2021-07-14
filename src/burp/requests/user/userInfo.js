const _debug = require('debug');

module.exports = async (client, userId, isFromSearch = false) => {
  const debug = _debug('bot:userInfo');

  let qs;
  if (isFromSearch) {
    qs = {
      from_module: `blended_search`,
    };
  }

  const response = await client.send({ url: `/api/v1/users/${userId}/info/`, qs });
  debug(response);

  return response;
};
