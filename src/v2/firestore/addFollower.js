const { isUndefined } = require('lodash');
const firestore = require('firebase-admin').firestore();
const debug = require('debug')('bot:firestore');

module.exports = async ({ username, pk }) => {
  const followersCol = firestore.collection('followers');
  const params = { project: process.env.PROJECT, timestamp: new Date() };
  if (!isUndefined(pk)) {
    params['pk'] = pk;
  }

  try {
    await followersCol.doc(username).create(params);
  } catch (e) {
    debug(`User already on follower list: ${username}`);
  }
}
