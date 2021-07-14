const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:accountsGetPresenceDisabled');

  const qs = {
    signed_body: `SIGNATURE.{}`
  };

  const response = await client.send({ url: `/api/v1/accounts/get_presence_disabled/`, qs });
  debug(response);

  return response;
};
