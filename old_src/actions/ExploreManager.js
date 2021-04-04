const { logHandler, quickSleep } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const { pick, random, sample, isEmpty } = require('lodash');

const SessionManager = require('../SessionManager');


class ExploreManager {
  constructor({ username, ig, addAction }) {
    this.username = username;
    this.ig       = ig;

    this.addAction = addAction;
  }

  async like() {
    let maxId = 0;
    let percentage = 20;

    while (true) {
      log(`Loading page ${maxId + 1}. ${percentage}% chances of liking on this page.`);

      const response = await SessionManager.call( () => this.topicalExplore({ repository: this.ig.discover, maxId: maxId }) );

      if (random(0, 100) <= percentage) {
        let mediaIds = [];

        for (let item of response['sectional_items']) {
          if (item['feed_type'] === 'media') {
            const medias = item['layout_content']['medias'];

            if (medias) {
              for (let media of item['layout_content']['medias']) {
                const mediaId = media['media']['id'];
                mediaIds = [ ...mediaIds, mediaId ];
              }
            }
          }
        }

        log(`Selected ${mediaIds.length} posts for liking.`);
        if (!isEmpty(mediaIds)) {
          const mediaId = sample(mediaIds);
          log(`Liking ${mediaId}`);

          const response = await SessionManager.call(() => {
            return this.ig.media.like({
              mediaId,
              moduleInfo: {
                module_name: 'explore_popular',
              },
              d: sample([0, 1]),
            });
          });
          log(response);

          await this.addAction({ type: 'likeExplore', reference: mediaId });
        }

        break;
      }

      percentage += 20;
      maxId++;
    }

    log('Done');
  }

  async follow() {
    let maxId = 0;
    let percentage = 20;

    while (true) {
      log(`Loading page ${maxId + 1}. ${percentage}% chances of following on this page.`);

      const response = await SessionManager.call( () => this.topicalExplore({ repository: this.ig.discover, maxId: maxId }) );

      if (random(0, 100) <= percentage) {
        let selectedUsers = [];

        for (let item of response['sectional_items']) {
          if (item['feed_type'] === 'media') {
            const medias = item['layout_content']['medias'];

            if (medias) {
              for (let media of item['layout_content']['medias']) {
                const user = media['media']['user'];

                if (!user['is_private'] && !user['is_verified'] && !user['has_anonymous_profile_picture']) {
                  const friendshipStatus = user['friendship_status'];
                  if (!friendshipStatus['following'] && !friendshipStatus['outgoing_request'] && !friendshipStatus['is_bestie'] && !friendshipStatus['is_restricted']) {
                    selectedUsers = [ ...selectedUsers, pick(user, ['pk', 'username']) ];
                  }
                }
              }
            }
          }
        }

        log(`Selected ${selectedUsers.length} users to follow.`);
        if (!isEmpty(selectedUsers)) {
          const user = sample(selectedUsers);

          log(`Visiting ${user['username']} profile`);
          await SessionManager.call( () => this.ig.user.info(user['pk']) );
          log(`Loading ${user['username']} feed`);
          await SessionManager.call(() => this.ig.feed.user(user['pk']).items() );

          log(`Following ${user['username']}`);
          const response = await SessionManager.call(() => {
            return this.ig.friendship.create(user['pk']);
          });
          log(response);

          await this.addAction({ type: 'followExplore', reference: user['username'] });
        }

        break;
      }

      percentage += 20;
      maxId++;
    }

    log('Done');
  }

  async scroll() {
    let maxId = 0;
    let percentage = 20;

    while (true) {
      log(`Loading page ${maxId + 1}. ${percentage}% chances of leaving on this page.`);

      await SessionManager.call( () => this.topicalExplore({ repository: this.ig.discover, maxId: maxId }) );

      if (random(0, 100) <= percentage) {
        break;
      }

      percentage += 20;
      maxId++;
    }

    log('Done');
  }

  async topicalExplore({ repository, maxId }) {
    const { body } = await repository.client.request.send({
      url: '/api/v1/discover/topical_explore/',
      qs: {
        is_prefetch: false,
        omit_cover_media: false,
        use_sectional_payload: true,
        timezone_offset: repository.client.state.timezoneOffset,
        session_id: repository.client.state.clientSessionId,
        include_fixed_destinations: false,
        max_id: maxId,
        module: 'explore_popular',
      },
    });
    return body;
  }
}

module.exports = ExploreManager;
