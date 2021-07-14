const { gzip } = require('node-gzip');
const _debug = require('debug');
const {bloksVersionId} = require("../../settings");
const {batteryLevel, getRandomId, stringifyForGzip} = require("../../utils");


module.exports = async (client, params={}) => {
  const debug = _debug('bot:feedTimeline');

  const feed_view_info = params.feed_view_info || [];
  const reason = params.reason || `cold_start_fetch`;
  const max_id = params.max_id;
  const client_view_state_media_list = params.client_view_state_media_list;

  const data = {
    feed_view_info,
    phone_id: client.getFamilyDeviceId(),
    max_id,
    client_view_state_media_list,
    reason,
    battery_level: batteryLevel(),
    timezone_offset: 0,
    device_id: client.getDeviceId(),
    request_id: getRandomId(),
    is_pull_to_refresh: 0,
    _uuid: client.getDeviceId(),
    is_charging: 1,
    is_dark_mode: 0,
    will_sound_on: 0,
    session_id: client.getClientSessionId(),
    bloks_versioning_id: bloksVersionId,
  };

  // const body = await gzip(JSON.stringify(data));
  const body = await gzip(stringifyForGzip(data));

  const headers = {
    'X-Ads-Opt-Out': 0,
    'X-DEVICE-ID': client.getDeviceId(),
    'X-CM-Bandwidth-KBPS': `-1.000`,
    'X-CM-Latency': `15.000`,
    ...client.headers(),
  };

  const response = await client.sendGzip({ url: `/api/v1/feed/timeline/`, method: 'POST', body, headers });
  debug(response);

  return response;
};
