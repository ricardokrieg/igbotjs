const { map } = require('lodash');
const firestore = require('firebase-admin').firestore();

module.exports = async () => {
  const blacklistCol = firestore.collection('blacklist');
  const res = await blacklistCol.where('project', '==', process.env.PROJECT).get();
  return map(res.docs, (doc) => doc.ref.id);
}
