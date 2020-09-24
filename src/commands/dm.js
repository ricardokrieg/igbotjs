const { logHandler } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('../Bot');
const SessionManager = require('../SessionManager');
const { sendMessage } = require('../actions/direct');

const username = process.env.IG_USERNAME;

const target = 'ricardokrieg';
const message = "Oi, estou fazendo uma parceria com o @brabosburguerthe. É hamburguer artesanal, fica no Dirceu. Tenho cupons de R$10 de desconto. Vc quer que eu te envie?";


(async () => {
  log('Start');

  const bot = new Bot({ username });

  try {
    await bot.setup();
    await bot.sessionManager.login();

    log(`Sending DM to ${target}...`);
    await SessionManager.call( () => sendMessage({ ig: bot.ig, target, message }) );
  } catch (e) {
    log.error(e);
    process.exit(1);
  }

  process.exit(0);
})();
