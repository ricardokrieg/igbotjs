const { logHandler, quickSleep } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const { random, sample, isEmpty } = require('lodash');

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

      const response = await this.topicalExplore({ repository: this.ig.discover, maxId: maxId });
      await quickSleep();

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

          break;
        }
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

      await this.topicalExplore({ repository: this.ig.discover, maxId: maxId });
      await quickSleep();

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
