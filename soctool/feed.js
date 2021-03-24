const { defaultsDeep } = require('lodash');
const Chance = require('chance');
const { gzip } = require('node-gzip');
const _debug = require('debug');

const batteryLevel = (deviceId) => {
  const chance = new Chance(deviceId);
  const percentTime = chance.integer({ min: 200, max: 600 });
  return 100 - (Math.round(Date.now() / 1000 / percentTime) % 100);
};

const feedReelsTray = async (client) => {
  const debug = _debug('bot:soctool:feed:reelsTray');

  const form = {
    supported_capabilities_new: JSON.stringify([{"name":"SUPPORTED_SDK_VERSIONS","value":"15.0,16.0,17.0,18.0,19.0,20.0,21.0,22.0,23.0,24.0,25.0,26.0,27.0,28.0,29.0,30.0,31.0,32.0,33.0,34.0,35.0,36.0,37.0,38.0,39.0,40.0,41.0,42.0,43.0,44.0,45.0,46.0,47.0,48.0,49.0,50.0,51.0,52.0,53.0,54.0,55.0,56.0,57.0,58.0,59.0,60.0,61.0,62.0,63.0,64.0,65.0,66.0,67.0,68.0,69.0,70.0,71.0,72.0,73.0,74.0"},{"name":"FACE_TRACKER_VERSION","value":"12"},{"name":"segmentation","value":"segmentation_enabled"},{"name":"COMPRESSION","value":"ETC2_COMPRESSION"},{"name":"world_tracker","value":"world_tracker_enabled"},{"name":"gyroscope","value":"gyroscope_enabled"}]),
    reason: `cold_start`,
    _csrftoken: client.attrs.token,
    _uuid: client.attrs.uuid,
  };

  const response = await client.send({ baseUrl: `https://b.i.instagram.com`, url: `/api/v1/feed/reels_tray/`, method: 'POST', form });
  debug(response);

  return response;
};

const feedTimeline = async (client) => {
  const debug = _debug('bot:soctool:feed:timeline');

  const body = await gzip(JSON.stringify({
    is_prefetch: `0`,
    phone_id: client.attrs.phoneId,
    reason: `cold_start_fetch`,
    battery_level: batteryLevel(client.attrs.deviceId),
    timezone_offset: -10800,
    _csrftoken: client.attrs.token,
    client_session_id: client.clientSessionId,
    device_id: client.attrs.deviceId,
    is_pull_to_refresh: '0',
    _uuid: client.attrs.uuid,
    is_on_screen: true,
    is_charging: 0,
    is_async_ads_in_headload_enabled: 0,
    rti_delivery_backend: 0,
    recovered_from_crash: 1,
    is_async_ads_double_request: 0,
    will_sound_on: 1,
    is_async_ads_rti: 0,
  }));

  const response = await client.sendGzip({ baseUrl: `https://b.i.instagram.com`, url: `/api/v1/feed/timeline/`, method: 'POST', body });
  debug(response);

  return response;
};

const feedUser = async (client, pk) => {
  const debug = _debug('bot:soctool:feed:user');

  const qs = {
    rank_token: `${pk}_${client.attrs.uuid}`,
    ranked_content: `True`,
    min_timestamp: ``,
  };

  const response = await client.send({ url: `/api/v1/feed/user/${pk}/`, qs });
  debug(response);

  return response;
};

const feedPopular = async (client, pk) => {
  const debug = _debug('bot:soctool:feed:popular');

  const qs = {
    rank_token: `${pk}_${client.attrs.uuid}`,
    ranked_content: `True`,
    people_teaser_supported: 1,
  };

  const response = await client.send({ url: `/api/v1/feed/popular/`, qs });
  debug(response);

  return response;
};

module.exports = {
  feedReelsTray,
  feedTimeline,
  feedUser,
  feedPopular,
};
