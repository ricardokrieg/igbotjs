const { gzip } = require('node-gzip');
const _debug = require('debug');


const feedTimeline = async (client, params={}) => {
  const debug = _debug('bot:feedTimeline');

  const feed_view_info = params.feed_view_info || [];
  const reason = params.reason || `cold_start_fetch`;
  const max_id = params.max_id;
  const client_view_state_media_list = params.client_view_state_media_list;

  const data = {
    feed_view_info,
    phone_id: client.attrs.phoneId,
    max_id,
    client_view_state_media_list,
    reason,
    battery_level: client.batteryLevel(),
    timezone_offset: 0,
    _csrftoken: client.csrfToken(),
    device_id: client.attrs.uuid,
    request_id: client.getRandomId(),
    is_pull_to_refresh: 0,
    _uuid: client.attrs.uuid,
    is_charging: 1,
    is_dark_mode: 0,
    will_sound_on: 0,
    session_id: client.clientSessionId(),
    bloks_versioning_id: client.attrs.bloksVersionId,
  };

  const body = await gzip(JSON.stringify(data));

  const response = await client.sendGzip({ url: `/api/v1/feed/timeline/`, method: 'POST', body });
  debug(response);

  return response;
};

module.exports = feedTimeline;
