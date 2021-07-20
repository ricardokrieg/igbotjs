const _debug = require('debug');
const {random, toPairs} = require("lodash");

module.exports = async (client) => {
  const debug = _debug('bot:requests:androidModulesDownload');

  const data = {
    _uid: client.getUserId(),
    _uuid: client.getDeviceId(),
    hashes: [`6b6b036b2cefb4b87743a8de386e044d21a9244c7db4607c0ef12abcacd689a6`],
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  let headers = {};
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
      default:
        headers[kv[0]] = kv[1];
        break;
    }
  }

  const response = await client.send({ url: `/api/v1/android_modules/download/`, method: 'POST', form, headers });
  debug(response);

  return response;
};
