const _debug = require('debug');

module.exports = async (client, pdqHash, uploadId) => {
  const debug = _debug('bot:requests:mediaUpdateMediaWithPdqHashInfo');

  const data = {
    pdq_hash_info: `[{\"pdq_hash\":\"${pdqHash}:100\",\"frame_time\":0}]`,
    _uid: client.getUserId(),
    _uuid: client.getDeviceId(),
    upload_id: uploadId,
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const response = await client.send({ url: `/api/v1/media/update_media_with_pdq_hash_info/`, method: 'POST', form });
  debug(response);

  return response;
};
