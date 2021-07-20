const _debug = require('debug');
const {toPairs} = require("lodash");

module.exports = async (client) => {
  const debug = _debug('bot:requests:directV2Inbox');

  const qs = {
    visual_message_return_type: `unseen`,
    persistentBadging: true,
    limit: 0,
  };

  const headers = {};
  for (let kv of toPairs(client.headers())) {
    headers[kv[0]] = kv[1];

    if (kv[0] === 'X-IG-Bandwidth-TotalTime-MS') {
      headers['X-IG-App-Startup-Country'] = client.getCountry();
    }
  }

  const response = await client.send({ url: `/api/v1/direct_v2/inbox/`, qs, headers });
  debug(response);

  return response;
};
