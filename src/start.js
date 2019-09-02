const Spinner = require('node-spintax');

const Bot = require('./bot');
const logger = require('./utils').logger;

const log = (message) => logger('Start', message);

const username = 'charliespears302';
const proxy = 'http://daenerys_insta:alphaxxxpass123@alpha.mobileproxy.network:11727';
const sourceUsername = 'alinemonaretto';
const follows = 20;
const likes = 10;
const dms = 2;
const spinner = new Spinner(
  "Que tal {comprar |}{um suplemento|uma vitamina} {pra|para} reforçar o treino, hein? rsrs\n" +
  "Dá uma olhada na minha loja. Acessando com esse link ganha R$30 de desconto na primeira compra. {bjs|beijinhos}\n" +
  "{http://bit.ly/DescontoBiovea}"
);


(async () => {
  log('Start');

  while(true) {
    try {
      await (new Bot(username, proxy)).start({ follows, likes, dms, spinner });
      break;
    } catch (e) {
      console.log(e);
    }

    console.log('Try again...');
  }

  log('End');
})();
