const _debug = require('debug');

module.exports = async (client, prefix, phoneNumber, verificationCode) => {
  const debug = _debug('bot:accountsValidateSignupSmsCode');

  const data = {
    verification_code: verificationCode,
    phone_number: `${prefix}${phoneNumber}`.replace(/[^\+0-9]/g, ''),
    guid: client.getDeviceId(),
    device_id: client.getAndroidId(),
    waterfall_id: client.getWaterfallId(),
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const response = await client.send({ url: `/api/v1/accounts/validate_signup_sms_code/`, method: 'POST', form });
  debug(response);

  return response;
};
