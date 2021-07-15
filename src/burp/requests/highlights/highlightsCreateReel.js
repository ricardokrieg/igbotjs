const _debug = require('debug');

module.exports = async (client, mediaId, title) => {
  const debug = _debug('bot:highlightsCreateReel');

  const data = {
    supported_capabilities_new: "[{\"name\":\"SUPPORTED_SDK_VERSIONS\",\"value\":\"90.0,91.0,92.0,93.0,94.0,95.0,96.0,97.0,98.0,99.0,100.0,101.0,102.0,103.0,104.0,105.0,106.0,107.0,108.0,109.0,110.0,111.0,112.0,113.0\"},{\"name\":\"FACE_TRACKER_VERSION\",\"value\":\"14\"},{\"name\":\"COMPRESSION\",\"value\":\"ETC2_COMPRESSION\"},{\"name\":\"world_tracker\",\"value\":\"world_tracker_enabled\"}]",
    source: `story_viewer_feed`,
    creation_id: Date.now().toString(),
    _uid: client.getUserId(),
    _uuid: client.getDeviceId(),
    cover: `{\"media_id\":\"${mediaId}\",\"crop_rect\":\"[0.0,0.21875,1.0,0.78125]\"}`,
    title,
    media_ids: `[\"${mediaId}\"]`,
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  let response;
  try {
    response = await client.send({ url: `/api/v1/highlights/create_reel/`, method: 'POST', form });
    debug(response);
  } catch (response) {
    debug(response);
  }

  return response;
};
