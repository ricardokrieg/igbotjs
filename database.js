const MongoClient = require('mongodb').MongoClient;
const assert = require('assert').strict;


const client = new MongoClient('mongodb://wolf:xxx123xxx@ds243963.mlab.com:43963/igbotjs', { useNewUrlParser: true, useUnifiedTopology: true });

(async () => {
  await client.connect();
  console.log('Connected correctly to server');

  const db = client.db('igbotjs');

  // const cookies = {
  //   version: 'tough-cookie@2.4.3',
  //   storeType: 'MemoryCookieStore',
  //   rejectPublicSuffixes: true,
  //   cookies:
  //     [ { key: 'csrftoken',
  //       value: 'qEZni8HSIK2F56DUJG5B91tAo1kgmgrG',
  //       expires: '2020-08-21T19:44:22.000Z',
  //       maxAge: 31449600,
  //       domain: 'instagram.com',
  //       path: '/',
  //       secure: true,
  //       hostOnly: false,
  //       creation: '2019-08-23T19:42:36.734Z',
  //       lastAccessed: '2019-08-23T19:44:22.933Z' },
  //       { key: 'rur',
  //         value: 'FTW',
  //         domain: 'instagram.com',
  //         path: '/',
  //         secure: true,
  //         httpOnly: true,
  //         hostOnly: false,
  //         creation: '2019-08-23T19:42:36.737Z',
  //         lastAccessed: '2019-08-23T19:44:22.934Z' },
  //       { key: 'mid',
  //         value: 'XWBBrAABAAHyHf9hUVJiOK3LtBsd',
  //         expires: '2029-08-20T19:42:36.000Z',
  //         maxAge: 315360000,
  //         domain: 'instagram.com',
  //         path: '/',
  //         secure: true,
  //         hostOnly: false,
  //         creation: '2019-08-23T19:42:36.739Z',
  //         lastAccessed: '2019-08-23T19:44:19.740Z' },
  //       { key: 'ds_user',
  //         value: 'charliespears302',
  //         expires: '2019-11-21T19:43:05.000Z',
  //         maxAge: 7776000,
  //         domain: 'instagram.com',
  //         path: '/',
  //         secure: true,
  //         httpOnly: true,
  //         hostOnly: false,
  //         creation: '2019-08-23T19:43:05.836Z',
  //         lastAccessed: '2019-08-23T19:44:19.740Z' },
  //       { key: 'ds_user_id',
  //         value: '16643013659',
  //         expires: '2019-11-21T19:44:22.000Z',
  //         maxAge: 7776000,
  //         domain: 'instagram.com',
  //         path: '/',
  //         secure: true,
  //         hostOnly: false,
  //         creation: '2019-08-23T19:43:05.843Z',
  //         lastAccessed: '2019-08-23T19:44:22.937Z' },
  //       { key: 'urlgen',
  //         value:
  //           '"{\\"27.55.69.103\\": 132061}:1i1FTy:FAlVcL8XKyM9RLYfop25SCqZ3qM"',
  //         domain: 'instagram.com',
  //         path: '/',
  //         secure: true,
  //         httpOnly: true,
  //         hostOnly: false,
  //         creation: '2019-08-23T19:43:05.845Z',
  //         lastAccessed: '2019-08-23T19:44:22.939Z' },
  //       { key: 'sessionid',
  //         value: '16643013659%3AzoFejYn9cyfn85%3A18',
  //         expires: '2020-08-22T19:43:05.000Z',
  //         maxAge: 31536000,
  //         domain: 'instagram.com',
  //         path: '/',
  //         secure: true,
  //         httpOnly: true,
  //         hostOnly: false,
  //         creation: '2019-08-23T19:43:05.847Z',
  //         lastAccessed: '2019-08-23T19:44:19.740Z' },
  //       { key: 'is_starred_enabled',
  //         value: 'yes',
  //         expires: '2029-08-20T19:43:17.000Z',
  //         maxAge: 315360000,
  //         domain: 'instagram.com',
  //         path: '/',
  //         secure: true,
  //         httpOnly: true,
  //         hostOnly: false,
  //         creation: '2019-08-23T19:43:18.308Z',
  //         lastAccessed: '2019-08-23T19:44:19.740Z' },
  //       { key: 'igfl',
  //         value: 'charliespears302',
  //         expires: '2019-08-24T19:43:17.000Z',
  //         maxAge: 86400,
  //         domain: 'instagram.com',
  //         path: '/',
  //         secure: true,
  //         httpOnly: true,
  //         hostOnly: false,
  //         creation: '2019-08-23T19:43:18.311Z',
  //         lastAccessed: '2019-08-23T19:44:19.740Z' } ] };
  // const state = {
  //   deviceString: '23/6.0.1; 480dpi; 1080x1920; Xiaomi; Redmi Note 3; kenzo; qcom',
  //   deviceId: 'android-140765fe21bf6f44',
  //   uuid: '93363d31-4aa3-58d4-8c36-84971b5f2731',
  //   phoneId: '8dbf9b43-f5db-549b-aa08-bd6887c246c0',
  //   adid: '3b0b12f5-abdd-5161-9c97-ed6da04dd37f',
  //   build: 'NRD91N'
  // };
  //
  // const r = await db.collection('accounts').insertOne({ _id: 'charliespears302', cookies, state });
  // assert.equal(1, r.insertedCount);

  const col = db.collection('accounts');
  // const docs = await col.find().toArray();
  const docs = await col.findOne({ _id: 'charliespears302' });
  // await col.updateOne({ _id: 'charliespears302' }, { $set: { state: { ...state, foo: 'bar' } } });

  console.log(docs);

  client.close();
})();
