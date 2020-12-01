const { defaultsDeep } = require('lodash');
const request = require('request-promise');
const _debug = require('debug');

const { feedReelsTray, feedTimeline } = require('./feed');

const loomFetchConfig = async (client) => {
  const debug = _debug('bot:soctool:start:loomFetchConfig');

  const response = await client.send({ url: `/api/v1/loom/fetch_config/` });
  debug(response);

  return response;
};

const multipleAccountsGetAccountFamily = async (client) => {
  const debug = _debug('bot:soctool:start:multipleAccountsGetAccountFamily');

  const response = await client.send({ url: `/api/v1/multiple_accounts/get_account_family/` });
  debug(response);

  return response;
};

const notificationsBadge = async (client) => {
  const debug = _debug('bot:soctool:start:notificationsBadge');

  const form = {
    phone_id: client.attrs.phoneId,
    _csrftoken: client.attrs.token,
    user_ids: client.attrs.userId,
    device_id: client.attrs.uuid,
    _uuid: client.attrs.uuid,
  };

  const response = await client.send({ url: `/api/v1/notifications/badge/`, method: 'POST', form });
  debug(response);

  return response;
};

module.exports = async (client) => {
  await feedReelsTray(client);
  await feedTimeline(client);
  await loomFetchConfig(client);
  await multipleAccountsGetAccountFamily(client);
  await notificationsBadge(client);
};
