const { logHandler } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const Bot = require('../Bot');
const followByUsername = require('../v2/actions/followByUsername');

const username = process.env.IG_USERNAME;


(async () => {
  log('Start');

  const bot = new Bot({ username });

  try {
    await bot.setup();
    await bot.sessionManager.login();

    const targets = [
      'oppo1966.222021',
      'bwqyl.bs',
      'hossinnoon',
      'edu81819',
      'alihazbavi7858',
      'roancunnigham',
      'edineitadachi',
      'fabricehildevert',
      'mallo_501',
      'viniciogualacata',
      'antonionunes.nunes.395',
      'albakingii',
      'tixienrique',
      'rhgdhr3532',
      'atiks9619',
      'perezvictormanuel15',
      'hinata_senpai.6',
      'rking6892',
      'jorgeantoniogonifalcon',
      'dave_laney',
      'lv656p',
      'jhonmario.gomez.792',
      'zenorfillraulsilv',
      'rossatoroberina69',
      'santinodecardo',
      'perspolio1369',
      'robertocastanedaramirez',
      'guapo4757',
      'pedronetos_',
      'william_f_cifuentes',
      'conanxcengo',
      'jimmy3334555',
      'inocenciohernandez9',
      'andradelimamarcospaulo',
      '_m_a_k_1111',
      'kauanftsado',
      'jarkkorouvinen',
      'casalemeraldo844recifepe',
      'zunigamauricioandresaravena',
      'jorge13chr',
      'rftlkhfjy58',
      'manuelcardenas9581',
      'williamobandova',
      'lo.nnie4260',
      'danyella509',
      'ipp0721',
      'cassio.ribeiro.52206654',
      'gilmarbezerra796',
      'robsonsilva.silva.3975012',
      'fabiopaulo5',
      'etlarrea',
      'qnelson19',
      'doniyoratajanov0809',
      'gabrielaguilarjulca',
      'hariomvishvakarma81',
      'ruzimatovd',
      'nestor.araujo.9256',
      'jcastaga',
      'cenaa514',
      'carlossouza6581',
      'sukhchain7357',
      'mattoso.39',
      'deoliveiratiengo',
      'marcoliguor',
      'usaxelo6',
      'reginaldo5940',
      'demonkiller00',
      'reriooliveira',
      'hithamelnegm',
      'fabiano.americo.7359',
      'caceresespinozaandres',
      'lucianobarreto427'
    ];

    let i = 1;
    for (let username of targets) {
      log(`Follow #${i}`);

      await followByUsername({ ig: bot.ig, username });

      i += 1;
    }
  } catch (e) {
    log.error(e);
    process.exit(1);
  }

  process.exit(0);
})();
