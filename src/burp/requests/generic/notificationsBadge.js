const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:notificationsBadge');

  const form = {
    phone_id: client.attrs.phoneId,
    _csrftoken: client.csrfToken(),
    user_ids: client.attrs.userId,
    device_id: client.attrs.uuid,
    _uuid: client.attrs.uuid,
  };

  const response = await client.send({ url: `/api/v1/notifications/badge/`, method: 'POST', form });
  debug(response);

  return response;
};
