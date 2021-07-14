const _debug = require('debug');

module.exports = async (client, userId) => {
  const debug = _debug('bot:fundraiserStandaloneFundraiserInfo');

  const response = await client.send({ url: `/api/v1/fundraiser/${userId}/standalone_fundraiser_info/` });
  debug(response);

  return response;
};
