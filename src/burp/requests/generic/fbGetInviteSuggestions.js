const _debug = require('debug');

module.exports = async (client, countOnly = false) => {
  const debug = _debug('bot:requests:fbGetInviteSuggestions');

  let form;
  if (countOnly) {
    form = {
      count_only: 1,
      _uuid: client.getDeviceId(),
    };
  } else {
    form = {
      offset: 0,
      _uuid: client.getDeviceId(),
      count: 50,
    };
  }

  const response = await client.send({ url: `/api/v1/fb/get_invite_suggestions/`, method: 'POST', form });
  debug(response);

  return response;
};
