const _debug = require('debug');

const { upCaseHeaders } = require('../../utils');

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

  const headers = upCaseHeaders(client.headers());

  const response = await client.send({ url: `/api/v1/accounts/check_phone_number/`, method: 'POST', form, headers });
  debug(response);

  return response;
};
