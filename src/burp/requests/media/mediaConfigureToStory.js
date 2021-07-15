const _debug = require('debug');
const {getRandomId} = require("../../utils");

module.exports = async (client, uploadId) => {
  const debug = _debug('bot:mediaConfigureToStory');

  const timestamp = Math.floor(new Date().getTime() / 1000);

  const data = {
    supported_capabilities_new: "[{\"name\":\"SUPPORTED_SDK_VERSIONS\",\"value\":\"90.0,91.0,92.0,93.0,94.0,95.0,96.0,97.0,98.0,99.0,100.0,101.0,102.0,103.0,104.0,105.0,106.0,107.0,108.0,109.0,110.0,111.0,112.0,113.0\"},{\"name\":\"FACE_TRACKER_VERSION\",\"value\":\"14\"},{\"name\":\"COMPRESSION\",\"value\":\"ETC2_COMPRESSION\"},{\"name\":\"world_tracker\",\"value\":\"world_tracker_enabled\"}]",
    camera_entry_point: `164`,
    original_media_type: `photo`,
    camera_session_id: getRandomId(),
    scene_capture_type: ``,
    timezone_offset: `${client.getTimezoneOffset()}`,
    client_shared_at: `${timestamp - 20}`,
    media_folder: `Download`,
    configure_mode: `1`,
    source_type: `4`,
    _uid: client.getUserId(),
    device_id: client.getAndroidId(),
    composition_id: getRandomId(),
    _uuid: client.getDeviceId(),
    creation_surface: `camera`,
    imported_taken_at: `${timestamp - 2000}`,
    capture_type: `normal`,
    upload_id: uploadId,
    client_timestamp: `${timestamp}`,
    device: {
      manufacturer: `unknown`,
      model: `Genymotion 'Phone'+version`,
      android_version: 26,
      android_release: `8.0.0`,
    },
    edits: {
      crop_original_size: [1080.0, 1346.0],
      crop_center: [0.0, -0.0],
      crop_zoom: 1.2462963,
    },
    extra: {
      source_width: 1080,
      source_height: 1346,
    },
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const response = await client.send({ url: `/api/v1/media/configure_to_story/`, method: 'POST', form });
  debug(response);

  return response;
};
