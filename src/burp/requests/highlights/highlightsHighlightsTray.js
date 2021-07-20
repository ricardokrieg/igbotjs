const _debug = require('debug');
const {batteryLevel} = require("../../utils");


module.exports = async (client, userId) => {
  const debug = _debug('bot:requests:highlightsHighlightsTray');

  const qs = {
    supported_capabilities_new: JSON.stringify([{"name":"SUPPORTED_SDK_VERSIONS","value":"90.0,91.0,92.0,93.0,94.0,95.0,96.0,97.0,98.0,99.0,100.0,101.0,102.0,103.0,104.0,105.0,106.0,107.0,108.0,109.0,110.0,111.0,112.0,113.0"},{"name":"FACE_TRACKER_VERSION","value":"14"},{"name":"COMPRESSION","value":"ETC2_COMPRESSION"},{"name":"world_tracker","value":"world_tracker_enabled"}]),
    phone_id: client.getFamilyDeviceId(),
    battery_level: batteryLevel(),
    is_charging: 1,
    is_dark_mode: 0,
    will_sound_on: 0,
  };

  const headers = {
    'X-Ads-Opt-Out': 0,
    'X-DEVICE-ID': client.getDeviceId(),
    'X-CM-Bandwidth-KBPS': `-1.000`,
    'X-CM-Latency': `15.000`,
    ...client.headers(),
  };

  const response = await client.send({ url: `/api/v1/highlights/${userId}/highlights_tray/`, qs, headers });
  debug(response);

  return response;
};
