const { logHandler, sleep } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const { random, sample, isEmpty } = require('lodash');

const SessionManager = require('../SessionManager');


class ExploreManager {
  constructor({ username, ig }) {
    this.username = username;
    this.ig       = ig;
  }

  async like() {
    let maxId = 0;
    let percentage = 20;

    while (true) {
      log(`Loading page ${maxId + 1}. ${percentage}% chances of liking on this page.`);

      const response = await this.topicalExplore({ repository: this.ig.discover, maxId: maxId });

      let value = random(0, 100);
      log(`Value = ${value}`);
      if (value <= percentage) {
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

          break;
        }
      }

      percentage += 20;
      maxId++;
    }

    log('Done');
  }

  async run({ limit }) {
    log(`Going to like ${limit} posts`);

    let count = 0;
    let maxId = 0;
    log(`Loading page ${maxId + 1}`);

    while (true) {
      const response = await this.topicalExplore({ repository: this.ig.discover, maxId: maxId });

      for (let item of response['sectional_items']) {
        if (item['feed_type'] === 'media') {
          for (let media of item['layout_content']['medias']) {
            const mediaId = media['media']['id'];

            // TODO, will like based on a percentage
            log(`Liking ${mediaId}`);
            count++;

            if (count > limit) {
              break;
            }
          }
        }

        if (count > limit) {
          break;
        }
      }

      if (count > limit) {
        break;
      }

      maxId++;
    }
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
