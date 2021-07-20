const _debug = require('debug');
const {toPairs} = require("lodash");

module.exports = async (client) => {
  const debug = _debug('bot:requests:usersArlinkDownloadInfo');

  const qs = {
    version_override: `2.2.1`,
  };

  const headers = {};
  for (let kv of toPairs(client.headers())) {
    headers[kv[0]] = kv[1];

    if (kv[0] === 'X-IG-Bandwidth-TotalTime-MS') {
      headers['X-IG-App-Startup-Country'] = client.getCountry();
    }
  }

  const response = await client.send({ url: `/api/v1/users/arlink_download_info/`, qs, headers });
  debug(response);

  return response;
};
