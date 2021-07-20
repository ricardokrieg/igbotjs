const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:discoverAyml');

  const form = {
    phone_id: client.getFamilyDeviceId(),
    module: `explore_people`,
    _uuid: client.getDeviceId(),
    show_trending_accounts: false,
    paginate: true,
  };

  const response = await client.send({ url: `/api/v1/discover/ayml/`, method: `POST`, form });
  debug(response);

  return response;
};
