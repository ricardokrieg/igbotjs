const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:notificationsStoreClientPushPermissions');

  const form = {
    enabled: true,
    device_id: client.getDeviceId(),
    _uuid: client.getDeviceId(),
  };

  const response = await client.send({ url: `/api/v1/notifications/store_client_push_permissions/`, method: 'POST', form });
  debug(response);

  return response;
};
