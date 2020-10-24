const { logHandler, inputUsername } = require('../utils');
const { IgCheckpointError } = require('instagram-private-api');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('../Bot');

(async () => {
  log('Start');

  const username = process.env.IG_USERNAME || await inputUsername();

  const bot = new Bot({ username });

  try {
    await bot.setup();
    await bot.sessionManager.login();
  } catch (e) {
    if (e instanceof IgCheckpointError) {
      log('XXXXX');
      log(e.url);

      const { body } = await bot.ig.request.send({
        url: '/challenge/?next=/api/v1/qe/sync/',
        qs: {
          guid: bot.ig.state.uuid,
          device_id: bot.ig.state.deviceId,
        },
      });
      log(body);
    } else {
      log.error(e);
      process.exit(1);
    }
  }

  process.exit(0);
})();
