const _debug = require('debug');
const { shuffle, compact, map, get } = require('lodash');
const Bluebird = require('bluebird');
const chance = require('chance').Chance();

const { sleep, quickSleep } = require('../../old/old2/v2/utils/sleep');
const Client = require('./client');
const notificationsBadge = require('./notificationsBadge');
const feedTimeline = require('./feedTimeline');
const feedReelsTray = require('./feedReelsTray');
const feedInjectedReelsMedia = require('./feedInjectedReelsMedia');
const userInfo = require('./userInfo');
const loomFetchConfig = require('./loomFetchConfig');
const scoresBootstrapUsers = require('./scoresBootstrapUsers');
const multipleAccountsGetAccountFamily = require('./multipleAccountsGetAccountFamily');
const wwwgraphqlIgQuery = require('./wwwgraphqlIgQuery');
const banyanBanyan = require('./banyanBanyan');
const statusGetViewableStatuses = require('./statusGetViewableStatuses');
const feedUser = require('./feedUser');
const directV2Inbox = require('./directV2Inbox');
const directV2GetPresence = require('./directV2GetPresence');
const highlightsHighlightsTray = require('./highlightsHighlightsTray');
const fbsearchIgShopRecentSearches = require('./fbsearchIgShopRecentSearches');
const fbsearchNullstateDynamicSections = require('./fbsearchNullstateDynamicSections');
const qpBatchFetch = require('./qpBatchFetch');
const commerceDestinationPrefetchEligible = require('./commerceDestinationPrefetchEligible');
const discoverTopicalExplore = require('./discoverTopicalExplore');
const fbsearchRecentSearches = require('./fbsearchRecentSearches');
const fbsearchTopsearchFlat = require('./fbsearchTopsearchFlat');
const feedUserStory = require('./feedUserStory');
const fbsearchRegisterRecentSearchClick = require('./fbsearchRegisterRecentSearchClick');
const friendshipsShow = require('./friendshipsShow');
const multipleAccountsGetFeaturedAccounts = require('./multipleAccountsGetFeaturedAccounts');
const discoverChaining = require('./discoverChaining');
const friendshipsCreate = require('./friendshipsCreate');

const debug = _debug('bot:simulate');

(async () => {
  const token = 'qfK9ydCVubNBMLrnaOYdPD0BQ40CDsNs';
  const userId = '48405653101';

  const attrs = {
    // proxy: 'http://44.193.4.221:8888',
    proxy: 'http://192.168.15.30:8888',

    locale: `en_US`,
    language: `en-US`,
    country: `US`,
    timezoneOffset: 0,
    igWwwClaim: `hmac.AR25Y__6VEUB35r51xd2ES1D4DTNQDeB50Z4oQIQroVIuh_b`,
    phoneId: '970f5113-bb0c-467e-a67e-fedf85ea38ad',
    token: token,
    userId: userId,
    uuid: '0362d54d-b663-47ba-97a6-96356e64c896',
    androidId: 'android-3c8a8d2f363a6ea',
    mid: 'YOQ4QQABAAEiEQd_o3WdlkW9xE-s',
    familyDeviceId: '970f5113-bb0c-467e-a67e-fedf85ea38ad',
    userAgent: `Instagram 187.0.0.32.120 Android (26/8.0.0; 160dpi; 600x976; unknown/Android; Genymotion 'Phone' version; cloud; vbox86; en_US; 289692202)`,
    bloksVersionId: `e097ac2261d546784637b3df264aa3275cb6281d706d91484f43c207d6661931`,
    cookies: `ig_direct_region_hint=FRC; ds_user_id=${userId}; mid=YOQ4QQABAAEiEQd_o3WdlkW9xE-s; sessionid=48405653101%3A7bPZLVmJPdpUYT%3A25; csrftoken=${token}; rur=FRC`,
  };

  const client = new Client(attrs);

  const threadTimeline = async () => {
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

  const traySessionId = client.getRandomId();
  const threadReels = async () => {
    const response = await feedReelsTray(client, traySessionId);

    await feedInjectedReelsMedia(client, traySessionId, response);
  }

  let running = true;
  const threadBackground = async () => {
    let requests = [
      () => notificationsBadge(client),
      () => qpBatchFetch(client),
    ];

    await sleep(4000);

    while (running) {
      await Bluebird.map(requests, thread => thread());

      running = false;
      await sleep(10000);
    }
  }

  const threadStopBackground = async () => {
    await sleep(30000);

    running = false;
  }

  const threadGraphql = async () => {
    await wwwgraphqlIgQuery(client, 0);
    await wwwgraphqlIgQuery(client, 1);
  };

  const threadGeneric = async () => {
    const requests = shuffle([
      () => loomFetchConfig(client),
      () => multipleAccountsGetAccountFamily(client),
      () => banyanBanyan(client),
    ]);

    await Bluebird.map(requests, request => request());
  };

  const threadFeed = async () => {
    await userInfo(client, attrs.userId);
    await feedUser(client, attrs.userId);
    await highlightsHighlightsTray(client, attrs.userId);
  };

  const threadDirect = async () => {
    await directV2Inbox(client);
    await directV2GetPresence(client);
  }

  threadBackground();

  let threads = [
    threadTimeline,
    threadReels,
  ];

  await Bluebird.map(threads, thread => thread());

  threads = [
    threadGraphql,
    threadGeneric,
    threadFeed,
    threadDirect,
  ];

  await Bluebird.map(threads, thread => thread());

  const userProfile = async (userId) => {
    const requests = [
      () => fbsearchRegisterRecentSearchClick(client, userId),
      () => friendshipsShow(client, userId),
      () => feedUser(client, userId),
      () => feedUserStory(client, userId),
      () => highlightsHighlightsTray(client, userId),
      () => multipleAccountsGetFeaturedAccounts(client, userId),
      () => userInfo(client, userId),
    ];

    await Bluebird.map(requests, request => request());
  };

  const followUser = async (userId) => {
    await friendshipsCreate(client, userId);
  };

  const threadSearch = async () => {
    const requests = shuffle([
      () => fbsearchNullstateDynamicSections(client),
      () => fbsearchRecentSearches(client),
      () => fbsearchIgShopRecentSearches(client),
      () => commerceDestinationPrefetchEligible(client),
    ]);

    await Bluebird.map(requests, request => request());

    const queries = [
      'query',
    ];

    for (let query of queries) {
      let searchResults = await fbsearchTopsearchFlat(client, query);

      for (let item of searchResults.list) {
        const username = get(item, 'user.username');
        const itemUserId = get(item, 'user.pk');
        const isPrivate = get(item, 'user.is_private');
        const following = get(item, 'user.friendship_status.following');

        if (!username || !itemUserId) {
          continue;
        }

        debug(`#${item.position} => ${username} (private? ${isPrivate}) (following? ${following})`);

        if (!isPrivate && !following) {
          await userProfile(itemUserId);
          await followUser(itemUserId);
        }
      }

      while (searchResults.has_more) {
        const params = {
          rank_token: searchResults.rank_token,
          page_token: searchResults.page_token,
        };

        searchResults = await fbsearchTopsearchFlat(client, query, params);

        for (let item of searchResults.list) {
          const username = get(item, 'user.username');
          const itemUserId = get(item, 'user.pk');
          const isPrivate = get(item, 'user.is_private');
          const following = get(item, 'user.friendship_status.following');

          if (!username || !itemUserId) {
            continue;
          }

          debug(`#${item.position} => ${username} (private? ${isPrivate}) (following? ${following})`);

          if (!isPrivate && !following) {
            await userProfile(itemUserId);
            await followUser(itemUserId);
          }
        }
      }
    }
  }

  await threadSearch();

  // await discoverTopicalExplore(client);
  // await discoverChaining(client, userId);
})();
