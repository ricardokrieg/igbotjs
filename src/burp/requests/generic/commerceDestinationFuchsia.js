const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:commerceDestinationFuchsia');

  const qs = {
    is_prefetch: true,
  };

  const response = await client.send({ url: `/api/v1/commerce/destination/fuchsia/`, qs });
  debug(response);

  return response;
};
