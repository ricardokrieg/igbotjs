const _debug = require('debug');
const {toPairs} = require("lodash");

module.exports = async (client, isFromSearch = false) => {
  const debug = _debug('bot:requests:discoverTopicalExplore');

  const max_id = isFromSearch ? 0 : undefined;
  const module = isFromSearch ? `explore_popular` : undefined;

  const qs = {
    is_prefetch: !isFromSearch,
    omit_cover_media: true,
    max_id,
    module,
    reels_configuration: `hide_hero`,
    use_sectional_payload: true,
    timezone_offset: 0,
    session_id: client.getClientSessionId(),
    include_fixed_destinations: true,
  };

  let headers = {};
  for (let kv of toPairs(client.headers())) {
    headers[kv[0]] = kv[1];

    if (!isFromSearch && kv[0] === `X-IG-Bandwidth-TotalTime-MS`) {
      headers['X-IG-Prefetch-Request'] = 'foreground';
    }
  }

  const response = await client.send({ url: `/api/v1/discover/topical_explore/`, qs, headers });
  debug(response);

  return response;
};
