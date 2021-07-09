const { map, isUndefined } = require('lodash');
const firestore = require('firebase-admin').firestore();

module.exports = async ({ limit = -1, usernameOnly = false } = {}) => {
  const targetsCol = firestore.collection('targets');
  let res = targetsCol.where('project', '==', process.env.PROJECT);

  if (limit > 0) {
    res = res.limit(limit);
  }

  res = await res.get();

  if (usernameOnly) {
    return map(res.docs, (doc) => doc.ref.id);
  } else {
    return map(res.docs, (doc) => ({ username: doc.ref.id, pk: doc.get('pk') }));
  }
}
