const _debug = require('debug');

const multipleAccountsGetAccountFamily = async (client) => {
  const debug = _debug('bot:multipleAccountsGetAccountFamily');

  const response = await client.send({ url: `/api/v1/multiple_accounts/get_account_family/` });
  debug(response);

  return response;
};

module.exports = multipleAccountsGetAccountFamily;
