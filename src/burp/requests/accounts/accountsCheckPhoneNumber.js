const _debug = require('debug');

module.exports = async (client, phoneNumber) => {
  const debug = _debug('bot:accountsCheckPhoneNumber');

  const data = {
    phone_id: client.getFamilyDeviceId(),
    login_nonce_map: `{}`,
    phone_number: `PHONE_NUMBER`,
    guid: client.getDeviceId(),
    device_id: client.getAndroidId(),
    prefill_shown: `False`,
  };

  const form = `signed_body=SIGNATURE.${encodeURIComponent(JSON.stringify(data))}`.replace('PHONE_NUMBER', phoneNumber.replace(/ /g, '+'));

  let response;
  try {
    response = await client.send({ url: `/api/v1/accounts/check_phone_number/`, method: 'POST', form });
    debug(response);
  } catch (response) {
    if (response.status !== `fail` || response.error_type !== `missing_parameters`) {
      throw response;
    }
    debug(response);
  }

  return response;
};
