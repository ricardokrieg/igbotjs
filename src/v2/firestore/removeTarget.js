const firestore = require('firebase-admin').firestore();

module.exports = async (username) => {
  const targetsCol = firestore.collection('targets');

  try {
    await targetsCol.doc(username).delete();
  } catch (e) {
    console.error(e.message);
  }
}
