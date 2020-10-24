const { map, isUndefined } = require('lodash');
const firestore = require('firebase-admin').firestore();

module.exports = async (usernameOnly = false) => {
  const targetsCol = firestore.collection('targets');
  const res = await targetsCol.where('project', '==', process.env.PROJECT).get();

  if (usernameOnly) {
    return map(res.docs, (doc) => doc.ref.id);
  } else {
    return map(res.docs, (doc) => ({ username: doc.ref.id, pk: doc.get('pk') }));
  }
}
