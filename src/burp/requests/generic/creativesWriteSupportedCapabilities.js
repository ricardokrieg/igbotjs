const _debug = require('debug');
const {toPairs} = require("lodash");

module.exports = async (client) => {
  const debug = _debug('bot:requests:creativesWriteSupportedCapabilities');

  const data = {
    supported_capabilities_new: "[{\"name\":\"SUPPORTED_SDK_VERSIONS\",\"value\":\"90.0,91.0,92.0,93.0,94.0,95.0,96.0,97.0,98.0,99.0,100.0,101.0,102.0,103.0,104.0,105.0,106.0,107.0,108.0,109.0,110.0,111.0,112.0,113.0\"},{\"name\":\"FACE_TRACKER_VERSION\",\"value\":\"14\"},{\"name\":\"COMPRESSION\",\"value\":\"ETC2_COMPRESSION\"},{\"name\":\"world_tracker\",\"value\":\"world_tracker_enabled\"}]",
    _uid: client.getUserId(),
    _uuid: client.getDeviceId(),
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  let headers = {};
  for (let kv of toPairs(client.headers())) {
    headers[kv[0]] = kv[1];

    if (kv[0] === `X-MID`) {
      headers['IG-U-IG-DIRECT-REGION-HINT'] = client.getDirectRegionHint();
    }
  }

  const response = await client.send({ url: `/api/v1/creatives/write_supported_capabilities/`, method: 'POST', form, headers });
  debug(response);

  return response;
};
