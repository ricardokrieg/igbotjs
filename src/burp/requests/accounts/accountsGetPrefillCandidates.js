const _debug = require('debug');

const { upCaseHeaders } = require('../../utils');

const accountsGetPrefillCandidates = async (client) => {
  const debug = _debug('bot:accountsGetPrefillCandidates');

  const data = {
    android_device_id: client.getAndroidId(),
    phone_id: client.getFamilyDeviceId(),
    usages: "[\"account_recovery_omnibox\"]",
    device_id: client.getDeviceId(),
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const headers = upCaseHeaders(client.headers());

  const response = await client.send({ url: `/api/v1/accounts/get_prefill_candidates/`, method: 'POST', form, headers });
  debug(response);

  return response;
};

module.exports = accountsGetPrefillCandidates;
