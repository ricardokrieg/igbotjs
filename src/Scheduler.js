const { logHandler } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const { isEmpty, sample, random, sumBy, times, without, head, last, slice } = require('lodash');


class Scheduler {
  static generate({ followLimit, publishLimit, storiesLimit, feedLimit }) {
    log('Generating schedule...');

    let actionTypes = [ 'follow', 'publish', 'stories', 'feed' ];
    let actions = [];

    while (true) {
      if (isEmpty(actionTypes)) {
        break;
      }

      switch (sample(actionTypes)) {
        case 'follow':
          const follows = 1 + random(0, followLimit/10);
          actions = [ ...actions, ...times(follows, () => 'follow') ];

          const followCount = sumBy(actions, (a) => a === 'follow' ? 1 : 0);

          if (followCount >= followLimit) {
            actionTypes = without(actionTypes, 'follow');
          }
          break;
        case 'publish':
          actions = [ ...actions, 'publish' ];

          const publishCount = sumBy(actions, (a) => a === 'publish' ? 1 : 0);

          if (publishCount >= publishLimit) {
            actionTypes = without(actionTypes, 'publish');
          }
          break;
        case 'stories':
          const stories = 1 + random(0, storiesLimit/10);
          actions = [ ...actions, ...times(stories, () => 'stories') ];

          const storiesCount = sumBy(actions, (a) => a === 'stories' ? 1 : 0);

          if (storiesCount >= storiesLimit) {
            actionTypes = without(actionTypes, 'stories');
          }
          break;
        case 'feed':
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
