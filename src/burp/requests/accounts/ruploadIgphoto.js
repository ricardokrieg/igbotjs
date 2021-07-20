const _debug = require('debug');
const { random } = require('lodash');
const {getRandomId} = require("../../utils");

module.exports = async (client, uploadFile) => {
  const debug = _debug('bot:requests:ruploadIgphoto');

  const uploadId = Date.now();
  const name = `${uploadId}_0_${random(1000000000, 9999999999)}`;
  const offset = 0;
  const contentLength = uploadFile.byteLength;
  const ruploadParams = {
    upload_id: uploadId.toString(),
    media_type: '1',
    image_compression: JSON.stringify({ lib_name: `moz`, lib_version: `3.1.m`, quality: `70` }),
  };
  const waterfallId = getRandomId();

  let headers = client.headers();

  delete headers['X-IG-App-Locale'];
  delete headers['X-IG-Device-Locale'];
  delete headers['X-IG-Mapped-Locale'];
  delete headers['X-Pigeon-Session-Id'];
  delete headers['X-Pigeon-Rawclienttime'];
  delete headers['X-IG-Bandwidth-Speed-KBPS'];
  delete headers['X-IG-Bandwidth-TotalBytes-B'];
  delete headers['X-IG-Bandwidth-TotalTime-MS'];
  delete headers['X-Bloks-Version-Id'];
  delete headers['X-IG-WWW-Claim'];
  delete headers['X-Bloks-Is-Layout-RTL'];
  delete headers['X-Bloks-Is-Panorama-Enabled'];
  delete headers['X-IG-Device-ID'];
  delete headers['X-IG-Family-Device-ID'];
  delete headers['X-IG-Android-ID'];
  delete headers['X-IG-Timezone-Offset'];

  let customHeaders = {
    'X_FB_PHOTO_WATERFALL_ID': waterfallId,
    'X-Instagram-Rupload-Params': JSON.stringify(ruploadParams),
    ...headers,
  };

  let response = await client.send({ url: `/rupload_igphoto/${name}`, headers: customHeaders });
  debug(response);

  customHeaders = {
    'X_FB_PHOTO_WATERFALL_ID': waterfallId,
    'X-Entity-Length': contentLength,
    'X-Entity-Name': name,
    'X-Instagram-Rupload-Params': JSON.stringify(ruploadParams),
    'X-Entity-Type': 'image/jpeg',
    'Offset': offset,
    'Content-Type': `application/octet-stream`,
    ...headers,
  };

  response = await client.send({ url: `/rupload_igphoto/${name}`, method: `POST`, headers: customHeaders, body: uploadFile });
  debug(response);

  return {
    uploadId,
  };
};
