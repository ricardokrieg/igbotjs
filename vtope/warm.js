const Bot = require('../old_src/Bot');
const follow = require('../old_src/v2/actions/followByUsername');
const { quickSleep, longSleep } = require('../old_src/v2/utils/sleep');
const VtopeAPI = require('./VtopeAPI');
const { random, sample } = require('lodash');
const debug = require('debug')('bot:vtope:run');

// const username = `dostoievskivt1`;
// const atoken = `Bwqdl9fYOdKl9vaSTapV4a3mQaCPsduk`;

const username = `dostoievskivt2`;
const atoken = `4EmSWWX1OZLexn8opPVuWRCXblqwodm9`;

// const username = `dostoievskivt3`;
// const atoken = `XuIVaqG1nI1ifApiPwZWuxT2COX9Hb67`;

const followCount = 27;

(async () => {
  try {
    debug(username);

    const api = new VtopeAPI();
    const bot = new Bot({ username });
    await bot.setup();

    await bot.sessionManager.login();

    let data;
    let i = 1;
    const lightPerc = 50;
    const lightActions = [`scrollExplore`, `scrollFeed`, `feedOpenProfile`, `feedOpenComments`, `search`];
    while(true) {
      if (random(0, 100) < lightPerc) {
        const action = sample(lightActions);
        debug(`Light Action: ${action}`);

        switch (action) {
          case 'scrollExplore':
            await bot.exploreManager.scroll();
            break;
          case 'scrollFeed':
            await bot.feedManager.scroll();
            break;
          case 'feedOpenProfile':
            await bot.feedManager.openProfile();
            break;
          case 'feedOpenComments':
            await bot.feedManager.openComments();
            break;
          case 'search':
            await bot.searchManager.search();
            break;
          default:
            debug.error(`Unknown Action: ${action}`);
            break;
        }

        await longSleep();
        continue;
      }

      debug(`Follow #${i}`);

      data = await api.requestFollow({ atoken });
      debug(data);

      const { id, shortcode } = data;

      await follow({ ig: bot.ig, username: shortcode });

      data = await api.taskSuccess({ atoken, id: id });
      debug(data);

      if (i >= followCount) break;

      i++;
      await longSleep();
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
