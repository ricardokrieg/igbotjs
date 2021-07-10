const _debug = require('debug');

const { upCaseHeaders } = require('../../utils');

module.exports = async (client, waterfallId) => {
  const debug = _debug('bot:dynamicOnboardingGetSteps');

  const data = {
    is_secondary_account_creation: `false`,
    fb_connected: `false`,
    seen_steps: `[]`,
    progress_state: `prefetch`,
    phone_id: client.getFamilyDeviceId(),
    fb_installed: `false`,
    locale: client.getLocale(),
    timezone_offset: `${client.getTimezoneOffset()}`,
    network_type: `WIFI-UNKNOWN`,
    guid: client.getDeviceId(),
    is_ci: `false`,
    android_id: client.getAndroidId(),
    waterfall_id: waterfallId,
    reg_flow_taken: `phone`,
    tos_accepted: `false`,
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const headers = upCaseHeaders(client.headers());

  const response = await client.send({ url: `/api/v1/dynamic_onboarding/get_steps/`, method: 'POST', form, headers });
  debug(response);

  return response;
};
