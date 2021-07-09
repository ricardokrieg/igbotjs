const { logHandler, quickSleep } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Spinner = require('node-spintax');
const Bot = require('../Bot');
const SessionManager = require('../SessionManager');
const { sendMessage } = require('../actions/direct');

const username = process.env.IG_USERNAME;
const targets = process.env.IG_TARGETS.split(',');
const link = 'https://bit.ly/3wW0ETi';

const spintax_messages = [
  "O que {vc|você} acharia de ganhar um {celular|iphone} {novinho|novinho em folha} em troca de 2 {minutos|minutinhos} do seu tempo? 😱\n" +
  "Seria {da hora|ótimo}, não {é mesmo|seria}?\n\n" +
  "{O time Casas Bahia está|Nós do time Casas Bahia estamos} realizando uma pesquisa de satisfação.\n" +
  "Todos {os participantes|que participarem} concorrem a 100 iPhones 📱\n\n" +
  "Acessa esse link para participar 👇\n\n" +
  `${link}`,

  "[FIRST_NAME], {estamos contando|contamos} com {vc|você} 😊"
];

const capitalize = (s) => {
  if (typeof s !== 'string') return '';

  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}


(async () => {
  log('Start');

  const bot = new Bot({ username });

  try {
    await bot.setup();
    await bot.sessionManager.login();

    let i = 1;
    for (let target of targets) {
      log(`${i++}) Sending DM to ${target}...`);

      log(`Searching ${target}...`);
      const { ranked_recipients } = await bot.ig.direct.rankedRecipients('raven', target);

      log(`Search returned ${ranked_recipients.length} users`);
      for (let rankedRecipientUser of ranked_recipients) {
        const { user: { pk, username, full_name } } = rankedRecipientUser;

        log(`Checking ${username}`);
        if (username === target) {
          log(`username=${username} pk=${pk} full_name=${full_name}`);
          await quickSleep();

          for (let spintax_message of spintax_messages) {
            const spinner = new Spinner(spintax_message);
            log(`Spinner total variations: ${spinner.countVariations()}`);

            const message = spinner.unspinRandom(1)[0].replace(/\[FIRST_NAME]/, capitalize(full_name.split(' ')[0]));
            log(`Message: ${message}`);

            await SessionManager.call( () => sendMessage({ ig: bot.ig, pk, message }) );
          }

          await quickSleep();
          break;
        }
      }
    }
  } catch (e) {
    log.error(e);
    process.exit(1);
  }

  process.exit(0);
})();
