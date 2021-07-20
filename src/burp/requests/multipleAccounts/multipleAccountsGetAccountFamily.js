const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:multipleAccountsGetAccountFamily');

  const response = await client.send({ url: `/api/v1/multiple_accounts/get_account_family/` });
  debug(response);

  return response;
};
