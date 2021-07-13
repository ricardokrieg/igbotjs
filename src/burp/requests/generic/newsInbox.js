const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:newsInbox');

  const qs = {
    mark_as_seen: false,
    timezone_offset: client.getTimezoneOffset(),
  };

  const response = await client.send({ url: `/api/v1/news/inbox/`, qs });
  debug(response);

  return response;
};
