const _debug = require('debug');

const multipleAccountsGetFeaturedAccounts = async (client, userId) => {
  const debug = _debug('bot:multipleAccountsGetFeaturedAccounts');

  const qs = {
    target_user_id: userId,
  };

  const response = await client.send({ url: `/api/v1/multiple_accounts/get_featured_accounts/`, qs });
  debug(response);

  return response;
};

module.exports = multipleAccountsGetFeaturedAccounts;
