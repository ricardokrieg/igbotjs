const _debug = require('debug');

module.exports = async (client, prefix, phoneNumber) => {
  const debug = _debug('bot:requests:accountsSendSignupSmsCode');

  const phone_number = `${prefix}${phoneNumber}`.replace(/[^\+0-9]/g, '');
  debug(`prefix=${prefix} phoneNumber=${phoneNumber} phone_number=${phone_number}`);

  const data = {
    phone_id: client.getFamilyDeviceId(),
    phone_number,
    guid: client.getDeviceId(),
    device_id: client.getAndroidId(),
    waterfall_id: client.getWaterfallId(),
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const response = await client.send({ url: `/api/v1/accounts/send_signup_sms_code/`, method: 'POST', form });
  debug(response);

  return response;
};
