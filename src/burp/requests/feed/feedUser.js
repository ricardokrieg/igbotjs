const _debug = require('debug');

module.exports = async (client, userId) => {
  const debug = _debug('bot:feedUser');

  const qs = {
    exclude_comment: true,
    only_fetch_first_carousel_media: false,
  };

  const response = await client.send({ url: `/api/v1/feed/user/${userId}/`, qs });
  debug(response);

  return response;
};
