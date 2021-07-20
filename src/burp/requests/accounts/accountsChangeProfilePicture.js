const _debug = require('debug');

const ruploadIgphoto = require('./ruploadIgphoto');

module.exports = async (client, photo, shareToFeed) => {
  const debug = _debug('bot:requests:accountsChangeProfilePicture');

  const { uploadId } = await ruploadIgphoto(client, photo);

  const form = {
    _uuid: client.getDeviceId(),
    use_fbuploader: true,
    share_to_feed: shareToFeed,
    upload_id: uploadId,
  };

  const response = await client.send({ url: `/api/v1/accounts/change_profile_picture/`, method: 'POST', form });
  debug(response);

  return response;
};
