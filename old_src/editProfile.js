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

    await bot.accountManager.editProfile({
      // name: 'Promoções em Teresina',
      // username: 'naturewatcher5',
      // bio: 'Segue a gente pra ficar por dentro de promoções exclusivas nos bares e restaurantes de Teresina',
      // url: 'linktr.ee/nature.watcher',
      profilePic: './profile.jpg',
    });
  } catch (e) {
    log.error(e);
    process.exit(1);
  }

  process.exit(0);
})();
