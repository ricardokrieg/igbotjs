const _debug = require('debug');

const {
  upCaseHeaders,
  createJazoest,
  encryptPassword,
  getSnNonce,
} = require('../../utils');

module.exports = async (client, prefix, phoneNumber, verificationCode, name, username, password, day, month, year, waterfallId) => {
  const debug = _debug('bot:accountsCreateValidated');

  const data = {
    is_secondary_account_creation: `false`,
    jazoest: createJazoest(client.getFamilyDeviceId()),
    tos_version: `row`,
    suggestedUsername: ``,
    verification_code: verificationCode,
    sn_result: `SN_RESULT`,
    do_not_auto_login_if_credentials_match: `true`,
    phone_id: client.getFamilyDeviceId(),
    enc_password: encryptPassword(client, password),
    phone_number: `PHONE_NUMBER`,
    username,
    first_name: name,
    day: `${day}`,
    adid: ``,
    guid: client.getDeviceId(),
    year: `${year}`,
    device_id: client.getAndroidId(),
    _uuid: client.getDeviceId(),
    month: `${month}`,
    sn_nonce: getSnNonce(`${prefix}${phoneNumber}`.replace(/[^\+0-9]/g, '')),
    force_sign_up_code: ``,
    waterfall_id: waterfallId,
    qs_stamp: ``,
    has_sms_consent: `true`,
    one_tap_opt_in: `true`,
  };

  const form = `signed_body=SIGNATURE.${encodeURIComponent(JSON.stringify(data))}`.replace('PHONE_NUMBER', `${prefix}${phoneNumber}`).replace('SN_RESULT', `GOOGLE_PLAY_UNAVAILABLE:+SERVICE_INVALID`);

  const headers = upCaseHeaders(client.headers());

  const response = await client.send({ url: `/api/v1/accounts/create_validated/`, method: 'POST', form, headers });
  debug(response);

  return response;
};
