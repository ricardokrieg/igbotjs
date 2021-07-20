const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:accountsGetPrefillCandidates');

  const data = {
    android_device_id: client.getAndroidId(),
    phone_id: client.getFamilyDeviceId(),
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
