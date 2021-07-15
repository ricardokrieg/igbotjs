const _debug = require('debug');

module.exports = async (client, caption, uploadId) => {
  const debug = _debug('bot:mediaConfigure');

  const data = {
    camera_entry_point: `164`,
    scene_capture_type: ``,
    timezone_offset: `${client.getTimezoneOffset()}`,
    source_type: `4`,
    _uid: client.getUserId(),
    device_id: client.getAndroidId(),
    _uuid: client.getDeviceId(),
    nav_chain: "039:feed_timeline:1,3mq:gallery_picker:2,3fF:photo_filter:3,FollowersShareFragment:metadata_followers_share:4",
    caption,
    upload_id: uploadId,
    multi_sharing: `1`,
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

  const response = await client.send({ url: `/api/v1/media/configure/`, method: 'POST', form });
  debug(response);

  return response;
};
