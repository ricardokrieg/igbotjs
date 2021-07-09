const _debug = require('debug');

const discoverTopicalExplore = async (client) => {
  const debug = _debug('bot:discoverTopicalExplore');

  const qs = {
    is_prefetch: false,
    omit_cover_media: true,
    max_id: 0,
    module: `explore_popular`,
    reels_configuration: `hide_hero`,
    use_sectional_payload: true,
    timezone_offset: 0,
    session_id: client.clientSessionId(),
    include_fixed_destinations: true,
  };

  const response = await client.send({ url: `/api/v1/discover/topical_explore/`, qs });
  debug(response);

  return response;
};

module.exports = discoverTopicalExplore;
