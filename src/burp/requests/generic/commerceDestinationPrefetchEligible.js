const _debug = require('debug');

const commerceDestinationPrefetchEligible = async (client) => {
  const debug = _debug('bot:commerceDestinationPrefetchEligible');

  const qs = {
    is_tab: true,
  };

  const response = await client.send({ url: `/api/v1/commerce/destination/prefetch/eligible/`, qs });
  debug(response);

  return response;
};

module.exports = commerceDestinationPrefetchEligible;
