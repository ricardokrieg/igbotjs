const firestore = require('firebase-admin').firestore();
const debug = require('debug')('bot:firestore');

module.exports = async ({ username, pk, source, sourceType }) => {
  const targetsCol = firestore.collection('potentialTargets');

  try {
    await targetsCol.doc(username).create({ pk, source, sourceType, project: process.env.PROJECT, timestamp: new Date() });
  } catch (e) {
    debug(`User already on potential target list: ${username}`);
  }
}
