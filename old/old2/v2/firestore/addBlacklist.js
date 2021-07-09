const { isUndefined } = require('lodash');
const firestore = require('firebase-admin').firestore();
const debug = require('debug')('bot:firestore');

module.exports = async ({ username, pk, source, sourceType }) => {
  const blacklistCol = firestore.collection('blacklist');
  const params = { project: process.env.PROJECT, timestamp: new Date() };
  if (!isUndefined(pk)) {
    params['pk'] = pk;
  }
  if (!isUndefined(source)) {
    params['source'] = source;
  }
  if (!isUndefined(sourceType)) {
    params['sourceType'] = sourceType;
  }

  try {
    await blacklistCol.doc(username).create(params);
  } catch (e) {
    debug(`User already on blacklist: ${username}`);
  }
}
