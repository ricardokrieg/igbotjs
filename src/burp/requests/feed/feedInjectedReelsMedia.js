const { gzip } = require('node-gzip');
const _debug = require('debug');
const {batteryLevel} = require("../../utils");
const { map, uniq } = require('lodash');


const feedInjectedReelsMedia = async (client, traySessionId, feedReelsTray = {}) => {
  const debug = _debug('bot:requests:feedInjectedReelsMedia');

  const trayUserIds = uniq([
    client.getUserId(),
    ...map(feedReelsTray.tray || [], (tray) => `${tray.id}`)
  ]);

  const data = {
    num_items_in_pool: `0`,
    is_ad_pod_enabled: `true`,
    is_prefetch: `true`,
    is_inventory_based_request_enabled: `true`,
    is_media_based_insertion_enabled: `true`,
    phone_id: client.getFamilyDeviceId(),
    is_ads_sensitive: `false`,
    entry_point_index: `0`,
    earliest_request_position: `0`,
    ad_request_index: `0`,
    battery_level: `${batteryLevel()}`,
    surface_q_id: `3159299667515380`,
    // _csrftoken: client.csrfToken(),
    tray_session_id: traySessionId,
    _uid: client.getUserId(),
    _uuid: client.getDeviceId(),
    is_charging: `1`,
    reel_position: `0`,
    is_dark_mode: `0`,
    viewer_session_id: traySessionId,
    will_sound_on: `0`,
    is_first_page: `true`,
    ad_and_netego_request_information: [],
    inserted_netego_indices: [],
    inserted_ad_indices: [],
    tray_user_ids: trayUserIds,
  };

  const body = await gzip(`signed_body=SIGNATURE.${JSON.stringify(data)}`);

  const headers = {
    'X-Ads-Opt-Out': 0,
    'X-DEVICE-ID': client.getDeviceId(),
    'X-CM-Bandwidth-KBPS': `-1.000`,
    'X-CM-Latency': `15.000`,
    ...client.headers(),
  };

  const response = await client.sendGzip({ url: `/api/v1/feed/injected_reels_media/`, method: 'POST', body, headers });
  debug(response);

  return response;
};

module.exports = feedInjectedReelsMedia;
