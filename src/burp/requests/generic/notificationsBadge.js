const _debug = require('debug');
const {toPairs, random} = require("lodash");

module.exports = async (client, modifyHeaders = false) => {
  const debug = _debug('bot:requests:notificationsBadge');

  const form = {
    phone_id: client.getFamilyDeviceId(),
    user_ids: client.getUserId(),
    device_id: client.getDeviceId(),
    _uuid: client.getDeviceId(),
  };

  let headers = client.headers();
  if (modifyHeaders) {
    headers = {};

    for (let kv of toPairs(client.headers())) {
      switch (kv[0]) {
        case 'X-IG-Bandwidth-Speed-KBPS':
          headers[kv[0]] = `${random(1800, 2200)}.000`;
          break;
        case 'X-IG-Bandwidth-TotalBytes-B':
          headers[kv[0]] = `${random(500000, 599999)}`;
          break;
        case 'X-IG-Bandwidth-TotalTime-MS':
          headers[kv[0]] = `${random(200, 299)}`;
          headers['X-IG-App-Startup-Country'] = client.getCountry();
          break;
        case 'X-MID':
          headers[kv[0]] = kv[1];
          headers['IG-U-IG-DIRECT-REGION-HINT'] = client.getDirectRegionHint();
          break;
        default:
          headers[kv[0]] = kv[1];
          break;
      }
    }
  }

  const response = await client.send({ url: `/api/v1/notifications/badge/`, method: 'POST', form, headers });
  debug(response);

  return response;
};
