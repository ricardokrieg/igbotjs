const _debug = require('debug');

module.exports = async (client) => {
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

  let response;
  try {
    response = await client.send({ url: `/api/v1/accounts/get_prefill_candidates/`, method: 'POST', form });
    debug(response);
  } catch (response) {
    if (response.status !== `fail` || response.message !== `Please wait a few minutes before you try again.`) {
      throw response;
    }
    debug(response);
  }

  return response;
};
