const _debug = require('debug');

const {
  createJazoest,
  encryptPassword,
  getSnNonce,
} = require('../../utils');

module.exports = async (client, prefix, phoneNumber, verificationCode, name, username, password, day, month, year) => {
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
    first_name: `NAME`,
    day: `${day}`,
    adid: ``,
    guid: client.getDeviceId(),
    year: `${year}`,
    device_id: client.getAndroidId(),
    _uuid: client.getDeviceId(),
    month: `${month}`,
    sn_nonce: getSnNonce(`${prefix}${phoneNumber}`.replace(/[^\+0-9]/g, '')),
    force_sign_up_code: ``,
    waterfall_id: client.getWaterfallId(),
    qs_stamp: ``,
    has_sms_consent: `true`,
    one_tap_opt_in: `true`,
  };

  // TODO compare request again. check for phone_number "+ -> %2B", name "(space) -> +" and sn_result ": -> %3A"
  const form = `signed_body=SIGNATURE.${encodeURIComponent(JSON.stringify(data))}`
    .replace('PHONE_NUMBER', `${prefix}${phoneNumber}`.replace(/\+/, `%2B`))
    .replace('NAME', name.replace(/ /, `+`))
    .replace('SN_RESULT', `GOOGLE_PLAY_UNAVAILABLE%3A+SERVICE_INVALID`);

  const response = await client.send({ url: `/api/v1/accounts/create_validated/`, method: 'POST', form });
  debug(response);

  return response;
};
