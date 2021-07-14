const Bluebird = require('bluebird');
const chance = require('chance').Chance();
const _debug = require('debug');
const {shuffle} = require("lodash");
const {getRandomId} = require("../utils");
const { compact, map, get } = require('lodash');

const {
  banyanBanyan,
  commerceDestinationFuchsia,
  devicesNdxApiAsyncGetNdxIgSteps,
  dynamicOnboardingGetSteps,
  loomFetchConfig,
  mediaBlocked,
  notificationsBadge,
  qpGetCooldowns,
  scoresBootstrapUsers,
} = require('../requests/generic');

const {
  feedTimeline,
  feedReelsTray,
  feedInjectedReelsMedia,
} = require('../requests/feed');

const {
  userInfo,
} = require('../requests/user');

const {
  highlightsHighlightsTray,
} = require('../requests/highlights');

const {
  discoverTopicalExplore,
} = require('../requests/discover');

const debug = _debug('bot:feedSignUp');

const feedTimelineThread = async (client) => {
  let response = await feedTimeline(client);

  if (response.more_available) {
    const client_view_state_media_list = compact(map(response.feed_items, (feed_item) => {
      const id = get(feed_item, 'media_or_ad.id');

      if (id === undefined) {
        return undefined;
      }

      return {
        id,
        type: 0,
      };
    }));

    const feed_view_info = compact(map(response.feed_items, (feed_item) => {
      const id = get(feed_item, 'media_or_ad.id');
      const media_type = get(feed_item, 'media_or_ad.media_type');

      if (id === undefined || media_type === undefined) {
        return undefined;
      }

      let media_id = undefined;

      switch (media_type) {
        case 1:
          media_id = id;
          break;
        case 8:
          const child_id = get(feed_item, 'media_or_ad.carousel_media.0.id');
          const child_media_type = get(feed_item, 'media_or_ad.carousel_media.0.media_type');

          if (child_media_type === 1) {
            media_id = `${id}-${child_id}`;
          }
      }

      if (media_id === undefined) {
        return undefined;
      }

      const media_pct = chance.integer({ min: 75000000, max: 95000000 });
      const time_info = chance.integer({ min: 5, max: 10 });

      return {
        media_id,
        version: 24,
        media_pct: `0.${media_pct}`,
        time_info: {
          10: time_info,
          25: time_info,
          50: time_info,
          75: time_info
        }
      };
    }));

    const params = {
      reason: `pagination`,
      feed_view_info: feed_view_info,
      max_id: response.next_max_id,
      client_view_state_media_list,
    };

    await feedTimeline(client, params);
  }
};

const reelsThread = async (client) => {
  const traySessionId = getRandomId();

  const response = await feedReelsTray(client, traySessionId);
  await feedInjectedReelsMedia(client, traySessionId, response);
};

const userThread = async (client) => {
  await userInfo(client, client.getUserId());
  await highlightsHighlightsTray(client, client.getUserId());
};

module.exports = async (client) => {
  debug(`Start`);

  let requests = [
    // () => reelsThread(client),
    // () => feedTimelineThread(client),
    // () => userThread(client),
    // () => devicesNdxApiAsyncGetNdxIgSteps(client),
    // () => dynamicOnboardingGetSteps(client, true),
    // () => banyanBanyan(client, true),
    // () => notificationsBadge(client),
    // () => mediaBlocked(client),
    // () => discoverTopicalExplore(client),
    // () => qpGetCooldowns(client),
    // () => commerceDestinationFuchsia(client),
    // () => loomFetchConfig(client),
    // () => scoresBootstrapUsers(client),
  ];

  await Bluebird.map(shuffle(requests), request => request(), { concurrency: 5 });

  debug(`End`);
};
