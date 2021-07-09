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


// fullname	username	password	yahoomail	password	phone	recoverymail
// CharlieSpears	charliespears302	MaxSmithM	charliespears302@yahoo.com	MaxSmithM	77077895214	WilliamKidd@mailnesia.com
// JohnCox	coxjohn243	TeresaCal	coxjohn243@yahoo.com	TeresaCal	77077030428	GraceAlexander@mailnesia.com
// CourtneyStafford	courtneystafford371	FrankSipp	courtneystafford371@yahoo.com	FrankSipp	77077030428	LeeBennett@mailnesia.com
// WesleyMolina	wesleymolina166	WilliamAl	wesleymolina166@yahoo.com	WilliamAl	77078261020	JamesWright@mailnesia.com
// WalterDiaz	walterdiaz5161	DorothyNall	walterdiaz516@yahoo.com	DorothyNall	77078261020	AshleyPack@mailnesia.com
// MariaJust	maria.just1	AnnLugoMi	maria.just@yahoo.com	AnnLugoMi	77077901148	WandaTurner@mailnesia.com
// StephenRiley	stephenriley9181	JosephRya	stephenriley918@yahoo.com	JosephRya	77077901148	SandraHall@mailnesia.com
// ElaineWatanabe	elainewatanabe1	MichaelRenfro	elainewatanabe@yahoo.com	MichaelRenfro	77075546290	BrendaLee@mailnesia.com
// ChristopherBerry	christopherberry4061	SergioWor	christopherberry406@yahoo.com	SergioWor	77075546290	JamesCyr@mailnesia.com
// LarryRamirez	larryramirez440	RobertChapman	larryramirez440@yahoo.com	RobertChapman	77077024309	AnnaStembridge@mailnesia.com