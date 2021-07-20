const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:creativesCameraEffectsGraphql');

  const data = {
    query_id: `4079337308755298`,
    _uid: client.getUserId(),
    _uuid: client.getDeviceId(),
    should_cap_tray: `true`,
    query_params: "{\"supported_compression_types\":[\"TAR_BROTLI\",\"ZIP\"],\"device_capabilities\":{\"models_max_supported_versions\":[{\"model_type\":\"faceTracker\",\"max_version\":14},{\"model_type\":\"hairSegmentation\",\"max_version\":1},{\"model_type\":\"bodyTracking\",\"max_version\":101},{\"model_type\":\"targetRecognition\",\"max_version\":109}],\"manifest_capabilities\":[\"faceTracker\",\"hairSegmentation\",\"targetRecognition\",\"worldTracker\",\"bodyTracking\",\"halfFloatRenderPass\",\"depthShaderRead\",\"multipleRenderTargets\",\"vertexTextureFetch\"],\"texture_compression\":\"ETC\",\"supported_sdk_versions\":{\"min_version\":90,\"max_version\":113}}}",
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const response = await client.send({ url: `/api/v1/creatives/camera_effects_graphql/`, method: 'POST', form });
  debug(response);

  return response;
};
