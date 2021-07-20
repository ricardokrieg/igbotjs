const _debug = require('debug');

module.exports = async (client, userId) => {
  const debug = _debug('bot:requests:feedUserStory');

  const qs = {
    supported_capabilities_new: JSON.stringify([{"name":"SUPPORTED_SDK_VERSIONS","value":"90.0,91.0,92.0,93.0,94.0,95.0,96.0,97.0,98.0,99.0,100.0,101.0,102.0,103.0,104.0,105.0,106.0,107.0,108.0,109.0,110.0,111.0,112.0,113.0"},{"name":"FACE_TRACKER_VERSION","value":"14"},{"name":"COMPRESSION","value":"ETC2_COMPRESSION"},{"name":"world_tracker","value":"world_tracker_enabled"}]),
  };

  const response = await client.send({ url: `/api/v1/feed/user/${userId}/story/`, qs });
  debug(response);

  return response;
};
