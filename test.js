const MongoClient = require('mongodb').MongoClient;
const assert = require('assert').strict;
const { map } = require('lodash');


const client = new MongoClient('mongodb://wolf:xxx123xxx@ds243963.mlab.com:43963/igbotjs', { useNewUrlParser: true, useUnifiedTopology: true });

(async () => {
  await client.connect();
  console.log('Connected correctly to server');

  const col = client.db('igbotjs').collection('followers_blacklist');

  // const usernames = [
  //   "tropeiraorestaurante",
  //   "fullmoonadventureclub",
  //   "dariusz1977000",
  //   "_fbmichael",
  //   "flavioacardozo",
  //   "ney_talles_",
  //   "andrescottti",
  //   "pedrinhoaguiarr",
  //   "jardellocutor",
  //   "irina_shayksharapova",
  //   "lucaseikeabsurda",
  //   "luizeduardosouzagomes",
  //   "adriano_graia",
  //   "marcioioppe",
  //   "pablo.rodrigues.barros",
  //   "djklebertoatoa",
  //   "applauzi_assessoria",
  //   "inovi.it",
  //   "teamfernandolima",
  //   "paulomatarese",
  //   "colmeiaclub_",
  //   "_luciana.vs",
  //   "almirmarquesoficial",
  //   "pousadaecojerimagia",
  //   "lucaslms15",
  //   "wescley10.11",
  //   "marciliolpontes",
  //   "fnnoire",
  //   "top.brazil",
  //   "karinestefany_",
  //   "__goordo",
  //   "veltzcapone",
  //   "flipe_sky",
  //   "guiismendes",
  //   "arakensenos",
  //   "gabrielfontesilva",
  //   "araujofrancisco87",
  //   "larissajesus12776",
  //   "teylordesouza",
  //   "denilsonperozzo",
  //   "clinicamedicaemsaopaulo",
  //   "miltonlucianoreis",
  //   "leocamargodance",
  //   "fanaticosdelmar",
  //   "p.jeronimoo",
  //   "rhangelcoimbra",
  //   "leidson2017",
  //   "giovanni_c_feitosa",
  //   "danielesly5",
  //   "conexaoitacare",
  //   "biquinidegrife",
  //   "dedeusheider",
  //   "sena.zr1",
  //   "claudiaogalli",
  //   "eliane.contadora",
  //   "rondinellis",
  //   "dionisiosueira",
  //   "itapua360",
  //   "diego_ferreira_99",
  //   "nacionalinnsalvador",
  //   "joaogarcia15",
  //   "manoelassisfotografia",
  //   "eduardodavidremottidelacruz",
  //   "diordanescosta",
  //   "frases_inteligentess",
  //   "joandryenriquemendo",
  //   "leilapmartins",
  //   "vitorgama94",
  //   "santiagobooster",
  //   "mascarenhasbrew",
  //   "_damusa_"
  // ];

  // for (const username of usernames) {
  //   try {
  //     const r = await col.insertOne({ _id: username, account: 'charliespears302' });
  //   } catch (err) {
  //     if (err.name === 'MongoError') {
  //       console.log(`Skipping ${username}`)
  //     } else {
  //       throw err;
  //     }
  //   }
  // }
  // assert.equal(1, r.insertedCount);

  // const col = db.collection('accounts');
  const docs = await col.find().toArray();
  // const docs = await col.findOne({ _id: 'charliespears302' });
  // await col.updateOne({ _id: 'charliespears302' }, { $set: { state: { ...state, foo: 'bar' } } });

  console.log(map(docs, '_id'));

  client.close();
})();
