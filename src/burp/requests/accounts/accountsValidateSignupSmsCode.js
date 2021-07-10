const _debug = require('debug');

const { upCaseHeaders } = require('../../utils');

module.exports = async (client, prefix, phoneNumber, verificationCode, waterfallId) => {
  const debug = _debug('bot:accountsValidateSignupSmsCode');

  const data = {
    verification_code: verificationCode,
    phone_number: `${prefix}${phoneNumber}`,
    guid: client.getDeviceId(),
    device_id: client.getAndroidId(),
    waterfall_id: waterfallId,
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const headers = upCaseHeaders(client.headers());

  const response = await client.send({ url: `/api/v1/accounts/validate_signup_sms_code/`, method: 'POST', form, headers });
  debug(response);

  return response;
};
