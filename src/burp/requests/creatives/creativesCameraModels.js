const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:creativesCameraModels');

  const data = {
    _uid: client.getUserId(),
    _uuid: client.getDeviceId(),
    model_request_blobs: "[{\"type\":\"world\"}]",
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const response = await client.send({ url: `/api/v1/creatives/camera_models/`, method: 'POST', form });
  debug(response);

  return response;
};
