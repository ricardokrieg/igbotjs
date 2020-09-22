const { logHandler } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('./Bot');

const username = process.env.IG_USERNAME;


(async () => {
  log('Start');

  const bot = new Bot({ username });

  try {
    await bot.setup();
    await bot.sessionManager.login();

    const publishResult = await bot.publishManager.publishImage({
      imagePath: './post3.jpg',
      caption: 'Não perca promoções nos melhores bares de Teresina',
      useLocation: false
    });

    log(publishResult);
  } catch (e) {
    log.error(e);
    process.exit(1);
  }

  process.exit(0);
})();
