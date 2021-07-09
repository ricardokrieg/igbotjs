const _debug = require('debug');

const userInfo = async (client, userId) => {
  const debug = _debug('bot:userInfo');

  // TODO this is shown only when click on search result
  const qs = {
    from_module: `blended_search`,
  };

  const response = await client.send({ url: `/api/v1/users/${userId}/info/`, qs });
  debug(response);

  return response;
};

module.exports = userInfo;
