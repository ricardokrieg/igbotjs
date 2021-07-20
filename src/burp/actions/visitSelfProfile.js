const Bluebird = require('bluebird');
const _debug = require('debug');

const {
  accountsFetchOnetap,
} = require('../requests/accounts');

const {
  feedUser,
  feedUserStory,
} = require('../requests/feed');

const {
  archiveReelProfileArchiveBadge,
  fbGetInviteSuggestions,
  fundraiserStandaloneFundraiserInfo,
  qpBatchFetch,
  wwwgraphqlIgQuery,
} = require('../requests/generic');

const {
  highlightsHighlightsTray
} = require('../requests/highlights');

const {
  userInfo,
} = require('../requests/user');

const graphqlThread = async (client) => {
  await wwwgraphqlIgQuery(client, 2);
  await wwwgraphqlIgQuery(client, 3);
  await wwwgraphqlIgQuery(client, 4);
};

const feedThread = async (client) => {
  await feedUserStory(client, client.getUserId());
  await feedUser(client, client.getUserId());
};

const inviteThread = async (client) => {
  await fbGetInviteSuggestions(client);
  await fbGetInviteSuggestions(client, true);
};

const debug = _debug('bot:actions:visitSelfProfile');

module.exports = async (client) => {
  debug(`Start`);

  let requests = [
    () => graphqlThread(client),
    () => accountsFetchOnetap(client),
    () => qpBatchFetch(client, `self_profile`),
    () => feedThread(client),
  ];

  await Bluebird.map(requests, request => request());

  requests = [
    () => highlightsHighlightsTray(client, client.getUserId()),
    () => userInfo(client, client.getUserId(), `self_profile`),
    () => archiveReelProfileArchiveBadge(client),
  ];

  await Bluebird.map(requests, request => request());

  requests = [
    () => inviteThread(client),
    () => fundraiserStandaloneFundraiserInfo(client, client.getUserId()),
  ];

  await Bluebird.map(requests, request => request());

  debug(`End`);
};
