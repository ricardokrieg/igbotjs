const _debug = require('debug');

module.exports = async (client, userId) => {
  const debug = _debug('bot:requests:fbsearchRegisterRecentSearchClick');

  const form = {
    entity_id: userId,
    // _csrftoken: client.csrfToken(),
    _uuid: client.getDeviceId(),
    entity_type: `user`,
  };

  const response = await client.send({ url: `/api/v1/fbsearch/register_recent_search_click/`, method: 'POST', form });
  debug(response);

  return response;
};
