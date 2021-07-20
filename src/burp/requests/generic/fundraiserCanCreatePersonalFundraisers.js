const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:fundraiserCanCreatePersonalFundraisers');

  const response = await client.send({ url: `/api/v1/fundraiser/can_create_personal_fundraisers/` });
  debug(response);

  return response;
};
