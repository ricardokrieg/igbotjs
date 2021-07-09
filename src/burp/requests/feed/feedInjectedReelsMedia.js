const { gzip } = require('node-gzip');
const _debug = require('debug');
const { map, uniq } = require('lodash');


const feedInjectedReelsMedia = async (client, traySessionId, feedReelsTray = {}) => {
  const debug = _debug('bot:feedInjectedReelsMedia');

  const trayUserIds = uniq([
    client.attrs.userId,
    ...map(feedReelsTray.tray || [], (tray) => tray.id)
  ]);

  const data = {
    num_items_in_pool: 0,
    is_ad_pod_enabled: false,
    is_prefetch: true,
    is_inventory_based_request_enabled: true,
    is_media_based_insertion_enabled: true,
    phone_id: client.attrs.phoneId,
    is_ads_sensitive: false,
    entry_point_index: 0,
    earliest_request_position: 0,
    ad_request_index: 0,
    battery_level: client.batteryLevel(),
    surface_q_id: "3159299667515380", // TODO
    _csrftoken: client.csrfToken(),
    tray_session_id: traySessionId,
    _uid: client.attrs.userId,
    _uuid: client.attrs.uuid,
    is_charging: 1,
    reel_position: 0,
    is_dark_mode: 0,
    viewer_session_id: traySessionId,
    will_sound_on: 0,
    is_first_page: true,
    ad_and_netego_request_information: [],
    inserted_netego_indices: [],
    inserted_ad_indices: [],
    tray_user_ids: trayUserIds,
  };

  const body = await gzip("signed_body=SIGNATURE." + JSON.stringify(data));

  const response = await client.sendGzip({ url: `/api/v1/feed/injected_reels_media/`, method: 'POST', body });
  debug(response);

  return response;
};

module.exports = feedInjectedReelsMedia;
