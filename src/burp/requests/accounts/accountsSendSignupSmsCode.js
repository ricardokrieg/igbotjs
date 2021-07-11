const _debug = require('debug');

const { upCaseHeaders } = require('../../utils');

module.exports = async (client, prefix, phoneNumber) => {
  const debug = _debug('bot:accountsSendSignupSmsCode');

  const data = {
    phone_id: client.getFamilyDeviceId(),
    phone_number: `${prefix}${phoneNumber}`,
    guid: client.getDeviceId(),
    device_id: client.getAndroidId(),
    waterfall_id: client.getWaterfallId(),
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const headers = upCaseHeaders(client.headers());

  const response = await client.send({ url: `/api/v1/accounts/send_signup_sms_code/`, method: 'POST', form, headers });
  debug(response);

  return response;
};
