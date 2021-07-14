const _debug = require('debug');
const {signupSeenSteps} = require("../../settings");

module.exports = async (client, afterSignup = false) => {
  const debug = _debug('bot:dynamicOnboardingGetSteps');

  let data;
  const userId = client.getUserId() || null;

  if (userId) {
    if (afterSignup) {
      data = {
        is_secondary_account_creation: `true`,
        fb_connected: `false`,
        seen_steps: signupSeenSteps,
        progress_state: `finish`,
        phone_id: client.getFamilyDeviceId(),
        fb_installed: `false`,
        locale: client.getLocale(),
        timezone_offset: `${client.getTimezoneOffset()}`,
        network_type: `WIFI-UNKNOWN`,
        guid: client.getDeviceId(),
        is_ci: `false`,
        android_id: client.getAndroidId(),
        waterfall_id: client.getWaterfallId(),
        reg_flow_taken: `phone`,
        tos_accepted: `true`,
      };
    } else {
      data = {
        is_secondary_account_creation: `false`,
        fb_connected: `false`,
        seen_steps: `[]`,
        progress_state: `start`,
        phone_id: client.getFamilyDeviceId(),
        fb_installed: `false`,
        locale: client.getLocale(),
        timezone_offset: `${client.getTimezoneOffset()}`,
        network_type: `WIFI-UNKNOWN`,
        _uid: client.getUserId(),
        guid: client.getDeviceId(),
        _uuid: client.getDeviceId(),
        is_ci: `false`,
        android_id: client.getAndroidId(),
        waterfall_id: client.getWaterfallId(),
        reg_flow_taken: `phone`,
        tos_accepted: `true`,
      };
    }
  } else {
    data = {
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
      waterfall_id: client.getWaterfallId(),
      reg_flow_taken: `phone`,
      tos_accepted: `false`,
    };
  }

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const headers = client.headers();
  delete headers['Authorization'];
  delete headers['IG-U-DS-USER-ID'];
  delete headers['IG-U-RUR'];
  headers['IG-INTENDED-USER-ID'] = 0;
  headers['X-IG-WWW-Claim'] = 0;

  const response = await client.send({ url: `/api/v1/dynamic_onboarding/get_steps/`, method: 'POST', form, headers });
  debug(response);

  return response;
};
