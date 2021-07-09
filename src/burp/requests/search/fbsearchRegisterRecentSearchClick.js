const _debug = require('debug');

const fbsearchRegisterRecentSearchClick = async (client, userId) => {
  const debug = _debug('bot:fbsearchRegisterRecentSearchClick');

  const form = {
    entity_id: userId,
    _csrftoken: client.csrfToken(),
    _uuid: client.attrs.uuid,
    entity_type: `user`,
  };

  const response = await client.send({ url: `/api/v1/fbsearch/register_recent_search_click/`, method: 'POST', form });
  debug(response);

  return response;
};

module.exports = fbsearchRegisterRecentSearchClick;
