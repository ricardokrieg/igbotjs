const _debug = require('debug');

module.exports = async (client, isEdit = false) => {
  const debug = _debug('bot:requests:accountsCurrentUser');

  let qs = {};
  if (isEdit) {
    qs = {
      edit: true,
    };
  }

  const response = await client.send({ url: `/api/v1/accounts/current_user/`, qs });
  debug(response);

  return response;
};
