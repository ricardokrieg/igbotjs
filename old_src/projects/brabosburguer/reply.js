const { remove, uniq, map } = require('lodash');
const { logHandler, longSleep } = require('../../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const DBManager = require('../../DBManager');
const Bot = require('../../Bot');
const { inbox, sendMessage } = require('../../actions/direct');
const inquirer = require('inquirer');

const PROJECT = process.env.PROJECT;

(async () => {
  log('Start');

  const dbManager = new DBManager({ username: null });

  const res = await dbManager.dmsCol().where('project', '==', PROJECT).get();
  let senders = uniq(map(res.docs, (doc) => doc.get('account')));
  remove(senders, (sender) => ['promosdirceu1', 'promosdirceu2', 'promosdirceu4', 'teresinapromon', 'teresinapromonews6', 'teresinacupom623', 'teresinacupom5396', 'teresinacupom5339', 'teresinacupom7521'].includes(sender));

  const callback = async ({ ig, sender, targetId, lastMessage, timestamp }) => {
    log(`(${timestamp.format('lll')}) ${sender}: ${lastMessage}`);

    const { message } = (await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: 'Reply',
      },
    ]));

    if (message === '') return Promise.resolve();

    await sendMessage({ ig, pk: targetId, message });
  }

  for (let username of senders) {
    const bot = new Bot({ username });

    try {
      await bot.setup();
      await bot.sessionManager.login();

      log('Loading inbox...');
      await inbox({ ig: bot.ig, callback, onlyForReply: true });
    } catch (e) {
      log.error(e);
    }
  }

  process.exit(0);
})();
