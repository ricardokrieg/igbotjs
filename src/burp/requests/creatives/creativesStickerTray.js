const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:creativesStickerTray');

  const data = {
    _uid: client.getUserId(),
    type: `static_stickers`,
    _uuid: client.getDeviceId(),
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const response = await client.send({ url: `/api/v1/creatives/sticker_tray/`, method: 'POST', form });
  debug(response);

  return response;
};
