const _debug = require('debug');

const { getRandomId } = require('../../utils');

module.exports = async (client) => {
  const debug = _debug('bot:requests:pushRegister');

  const token = {
    ck: `327690121831187`,
    ai: 567310203415052,
    di: getRandomId(),
    pn: `com.instagram.android`
  };
  const base64Token = Buffer.from(JSON.stringify(token)).toString('base64');
  // const deviceToken = encodeURIComponent(JSON.stringify({ k: base64Token, v: 0, t: `fbns-b64` }));

  const form = {
    device_type: `android_mqtt`,
    is_main_push_channel: true,
    device_sub_type: 2,
    device_token: JSON.stringify({k: base64Token, v: 0, t: `fbns-b64`}),
    guid: client.getDeviceId(),
    _uuid: client.getDeviceId(),
    users: client.getUserId(),
    family_device_id: client.getFamilyDeviceId(),
  };

  const response = await client.send({ url: `/api/v1/push/register/`, method: 'POST', form });
  debug(response);

  return response;
};
