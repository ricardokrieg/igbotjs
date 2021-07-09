const Bot = require('../old_src/Bot');
const follow = require('../old_src/v2/actions/followById');
const { quickSleep } = require('../old_src/v2/utils/sleep');
const VtopeAPI = require('./VtopeAPI');
const debug = require('debug')('bot:vtope:run');

// const username = `dostoievskivt1`;
// const atoken = `Bwqdl9fYOdKl9vaSTapV4a3mQaCPsduk`;

// const username = `dostoievskivt2`;
// const atoken = `4EmSWWX1OZLexn8opPVuWRCXblqwodm9`;

const username = `dostoievskivt3`;
const atoken = `XuIVaqG1nI1ifApiPwZWuxT2COX9Hb67`;

// const username = `dostoievskivt4`;
// const atoken = ``;

const followCount = 0;

(async () => {
  try {
    debug(username);

    const api = new VtopeAPI();
    const bot = new Bot({ username });
    await bot.setup();

    // bot.sessionManager.newDevice = true;
    await bot.sessionManager.login();

    let data;
    let i = 0;
    while(++i <= followCount) {
      debug(`Follow #${i}`);

      data = await api.requestFollow({ atoken });
      debug(data);

      const { id, item_id } = data;

      await follow({ ig: bot.ig, pk: item_id });

      data = await api.taskSuccess({ atoken, id: id });
      debug(data);

      await quickSleep();
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
