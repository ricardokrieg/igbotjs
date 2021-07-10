const _debug = require('debug');

const accountsGetPrefillCandidates = async (client) => {
  const debug = _debug('bot:accountsGetPrefillCandidates');

  const data = {
    android_device_id: "android-1d1ba5a07566ce0c",
    phone_id: "d0b16d92-fc09-4ddc-beee-a9b88b85b288",
    usages: "[\"account_recovery_omnibox\"]",
    device_id: client.getDeviceId(),
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const response = await client.send({ url: `/api/v1/accounts/get_prefill_candidates/`, method: 'POST', form });
  debug(response);

  return response;
};

module.exports = accountsGetPrefillCandidates;
