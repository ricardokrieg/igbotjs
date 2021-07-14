const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:notificationsBadge');

  const form = {
    phone_id: client.getFamilyDeviceId(),
    // _csrftoken: client.csrfToken(),
    user_ids: client.getUserId(),
    device_id: client.getDeviceId(),
    _uuid: client.getDeviceId(),
  };

  const response = await client.send({ url: `/api/v1/notifications/badge/`, method: 'POST', form });
  debug(response);

  return response;
};
