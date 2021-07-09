const _debug = require('debug');
const { shuffle, compact, map, get } = require('lodash');
const Bluebird = require('bluebird');
const chance = require('chance').Chance();

const {
  directV2GetPresence,
  directV2Inbox,
} = require('../requests/direct');

const {
  feedInjectedReelsMedia,
  feedReelsTray,
  feedTimeline,
  feedUser,
} = require('../requests/feed');

const {
  banyanBanyan,
  loomFetchConfig,
  notificationsBadge,
  qpBatchFetch,
  wwwgraphqlIgQuery,
} = require('../requests/generic');

const {
  highlightsHighlightsTray,
} = require('../requests/highlights');

const {
  multipleAccountsGetAccountFamily,
} = require('../requests/multipleAccounts');

const {
  userInfo,
} = require('../requests/user');

const debug = _debug('bot:afterLogin');

const requestsTimeline = async (client) => {
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
      feed_view_info,
      max_id: response.next_max_id,
      client_view_state_media_list,
    };

    await feedTimeline(client, params);
  }
};

const requestsReels = async (client) => {
  const traySessionId = client.getRandomId();
  const response = await feedReelsTray(client, traySessionId);

  await feedInjectedReelsMedia(client, traySessionId, response);
};

const requestsGraphQL = async (client) => {
  await wwwgraphqlIgQuery(client, 0);
  await wwwgraphqlIgQuery(client, 1);
};

const requestsGeneric = async (client) => {
  const requests = shuffle([
    () => notificationsBadge(client),
    () => qpBatchFetch(client),
    () => loomFetchConfig(client),
    () => multipleAccountsGetAccountFamily(client),
    () => banyanBanyan(client),
  ]);

  await Bluebird.map(requests, request => request());
};

const requestsFeed = async (client) => {
  await userInfo(client, client.attrs.userId);
  await feedUser(client, client.attrs.userId);
  await highlightsHighlightsTray(client, client.attrs.userId);
};

const requestsDirect = async (client) => {
  await directV2Inbox(client);
  await directV2GetPresence(client);
};

const afterLogin = async (client) => {
  debug(`Start`);

  let requests = [
    () => requestsTimeline(client),
    () => requestsReels(client),
  ];

  await Bluebird.map(requests, request => request());

  requests = [
    () => requestsGeneric(client),
    () => requestsGraphQL(client),
    () => requestsFeed(client),
    () => requestsDirect(client),
  ];

  await Bluebird.map(requests, request => request());

  debug(`End`);
};

module.exports = afterLogin;
