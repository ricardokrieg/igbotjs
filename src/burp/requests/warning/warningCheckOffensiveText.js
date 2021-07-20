const _debug = require('debug');

module.exports = async (client, text) => {
  const debug = _debug('bot:requests:warningCheckOffensiveText');

  const data = {
    _uid: client.getUserId(),
    text,
    _uuid: client.getDeviceId(),
    request_type: `caption`,
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const response = await client.send({ url: `/api/v1/warning/check_offensive_text/`, method: 'POST', form });
  debug(response);

  return response;
};
