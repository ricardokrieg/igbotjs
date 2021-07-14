const _debug = require('debug');
const {toPairs} = require("lodash");

module.exports = async (client) => {
  const debug = _debug('bot:clipsDiscover');

  const form = {
    _uuid: client.getDeviceId(),
    container_module: `clips_viewer_clips_tab`,
  };

  let headers = {};
  for (let kv of toPairs(client.headers())) {
    headers[kv[0]] = kv[1];

    if (kv[0] === `X-IG-Bandwidth-TotalTime-MS`) {
      headers['X-IG-Prefetch-Request'] = 'foreground';
    }
  }

  const response = await client.send({ url: `/api/v1/clips/discover/`, method: `POST`, form, headers });
  debug(response);

  return response;
};
