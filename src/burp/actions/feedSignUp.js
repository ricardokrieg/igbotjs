const Bluebird = require('bluebird');
const chance = require('chance').Chance();
const _debug = require('debug');
const {getRandomId, sleep} = require("../utils");
const { compact, map, get } = require('lodash');

const {
  androidModulesDownload,
  attributionLogResurrectAttribution,
  banyanBanyan,
  commerceDestinationFuchsia,
  creativesWriteSupportedCapabilities,
  devicesNdxApiAsyncGetNdxIgSteps,
  dynamicOnboardingGetSteps,
  loomFetchConfig,
  mediaBlocked,
  notificationsBadge,
  notificationsStoreClientPushPermissions,
  qpBatchFetch,
  qpGetCooldowns,
  scoresBootstrapUsers,
  statusGetViewableStatuses,
  usersArlinkDownloadInfo,
  wwwgraphqlIgQuery,
} = require('../requests/generic');

const {
  feedTimeline,
  feedReelsTray,
  feedInjectedReelsMedia,
  feedUser,
} = require('../requests/feed');

const {
  userInfo,
} = require('../requests/user');

const {
  highlightsHighlightsTray,
} = require('../requests/highlights');

const {
  clipsDiscover,
  discoverTopicalExplore,
} = require('../requests/discover');

const {
  directV2GetPresence,
  directV2HasInteropUpgraded,
  directV2Inbox,
} = require('../requests/direct');

const {
  accountsGetPresenceDisabled,
  accountsProcessContactPointSignals,
} = require('../requests/accounts');

const debug = _debug('bot:actions:feedSignUp');

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

const banyanBanyanThread = async (client) => {
  await banyanBanyan(client, true);
  await sleep(10000);
  await banyanBanyan(client, true, true);
};

const notificationsBadgeThread = async (client) => {
  await notificationsBadge(client);
  await sleep(5000);
  await notificationsBadge(client, true);
}

const directThread = async (client) => {
  await directV2Inbox(client);
  await directV2GetPresence(client);
  await directV2HasInteropUpgraded(client);
}

module.exports = async (client) => {
  debug(`Start`);

  let requests = [
    () => reelsThread(client),
    () => feedTimelineThread(client),
    () => userThread(client),
    () => banyanBanyanThread(client),
    () => notificationsBadgeThread(client),
    () => directThread(client),
    () => devicesNdxApiAsyncGetNdxIgSteps(client),
    () => dynamicOnboardingGetSteps(client, true),
    () => mediaBlocked(client),
    () => discoverTopicalExplore(client),
    () => qpGetCooldowns(client),
    () => commerceDestinationFuchsia(client),
    () => loomFetchConfig(client),
    () => scoresBootstrapUsers(client),
    () => usersArlinkDownloadInfo(client),
    () => qpBatchFetch(client, `feed`),
    () => accountsProcessContactPointSignals(client),
    () => accountsGetPresenceDisabled(client),
    () => statusGetViewableStatuses(client),
    () => clipsDiscover(client),
    () => notificationsStoreClientPushPermissions(client),
    () => creativesWriteSupportedCapabilities(client),
    () => attributionLogResurrectAttribution(client),
  ];

  await Bluebird.map(requests, request => request(), { concurrency: 5 });

  requests = [
    () => feedUser(client, client.getUserId()),
    () => wwwgraphqlIgQuery(client),
    () => androidModulesDownload(client),
  ];

  await Bluebird.map(requests, request => request());

  debug(`End`);
};
