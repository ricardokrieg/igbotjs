const { logHandler } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const { isEmpty, sample, random, sumBy, times, without, last, slice } = require('lodash');


class Scheduler {
  static generate({ followLimit, publishLimit, storiesLimit, feedLimit }) {
    log('Generating schedule...');

    let actionTypes = [ 'follow', 'stories', 'feed' ];

    if (publishLimit && random(0, 100) < publishLimit) {
      log(`Publish added`);
      actionTypes = [ ...actionTypes, 'publish' ];
    }

    let actions = [];

    while (true) {
      if (isEmpty(actionTypes)) {
        break;
      }

      switch (sample(actionTypes)) {
        case 'follow':
          if (!followLimit) {
            actionTypes = without(actionTypes, 'follow');
            break;
          }

          const follows = 1 + random(0, followLimit/10);
          actions = [ ...actions, ...times(follows, () => 'follow') ];

          const followCount = sumBy(actions, (a) => a === 'follow' ? 1 : 0);

          if (followCount >= followLimit) {
            actionTypes = without(actionTypes, 'follow');
          }
          break;
        case 'publish':
          actionTypes = without(actionTypes, 'publish');

          actions = [ ...actions, 'publish' ];

          break;
        case 'stories':
          if (!storiesLimit) {
            actionTypes = without(actionTypes, 'stories');
            break;
          }

          const stories = 1 + random(0, storiesLimit/10);
          actions = [ ...actions, ...times(stories, () => 'stories') ];

          const storiesCount = sumBy(actions, (a) => a === 'stories' ? 1 : 0);

          if (storiesCount >= storiesLimit) {
            actionTypes = without(actionTypes, 'stories');
          }
          break;
        case 'feed':
          if (!feedLimit) {
            actionTypes = without(actionTypes, 'feed');
            break;
          }

          const feeds = 1 + random(0, feedLimit/10);
          actions = [ ...actions, ...times(feeds, () => 'feed') ];

          const feedCount = sumBy(actions, (a) => a === 'feed' ? 1 : 0);

          if (feedCount >= feedLimit) {
            actionTypes = without(actionTypes, 'feed');
          }
          break;
      }
    }

    let schedule = [];
    for (const action of actions) {
      const lastItem = last(schedule);

      if (lastItem && lastItem.action === action) {
        schedule = [
          ...slice(schedule, 0, schedule.length - 1),
          { ...lastItem, limit: lastItem.limit + 1 },
        ];
      } else {
        schedule = [
          ...schedule,
          { action: action, limit: 1 },
        ];
      }
    }

    return schedule;
  }
}

module.exports = Scheduler;
