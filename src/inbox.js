const inquirer = require('inquirer');

const Bot = require('./bot');
const logger = require('./utils').logger;

const log = (message) => logger('Inbox', message);


(async () => {
  log('Start');

  const { username } = (await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Username',
    },
  ]));

  while(true) {
    try {
      await (new Bot({ username })).checkInbox();
      // const message = "Que tal um suplemento pra reforçar o treino, hein? rsrs\nDá uma olhada na minha loja. Acessando com esse link ganha R$30 de desconto na primeira compra. beijinhos\nhttps://cli.re/6ZARA2";
      // const message = "Oi, bom dia";
      // await (new Bot({ username })).sendDM({ target: 'ricardokrieg', message });
      break;
    } catch (e) {
      console.log(e);
    }

    console.log('Try again...');
  }

  log('End');
})();
