const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:creativesGetUnlockableStickerNux');

  const response = await client.send({ url: `/api/v1/creatives/get_unlockable_sticker_nux/` });
  debug(response);

  return response;
};
