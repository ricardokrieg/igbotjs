const _debug = require('debug');
const querystring = require("querystring");

module.exports = async (client, userIds) => {
  const debug = _debug('bot:requests:friendshipsShowMany');

  const data = {
    user_ids: `USER_IDS`,
    _uuid: client.getDeviceId(),
  };

  const body = `${querystring.stringify(data)}`.replace(/USER_IDS/, userIds.join(','));

  const response = await client.send({ url: `/api/v1/friendships/show_many/`, method: 'POST', body });
  debug(response);

  return response;
};
