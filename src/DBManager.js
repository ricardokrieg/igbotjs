const { logHandler } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);

const firebase = require('firebase');
require('firebase/firestore');

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://instagram-bot-js.firebaseio.com'
});

const firestore = admin.firestore();

class DBManager {
  constructor({ username }) {
    this.username = username;
  }

  getCol(name) {
    return firestore.collection(name);
  }

  accountsCol() {
    return this.getCol('accounts');
  }

  runsCol() {
    return this.getCol('runs');
  }

  actionsCol() {
    return this.getCol('actions');
  }

  statsCol() {
    return this.getCol('stats');
  }

  targetsCol() {
    return this.getCol('targets');
  }

  uploadsCol() {
    return this.getCol('uploads');
  }

  dmsCol() {
    return this.getCol('direct');
  }

  // this.errorsCol = client.db('igbotjs').collection('errors');

  async updateCookiesAndState({ cookies, state }) {
    await this.accountRef().set({ cookies, state }, { merge: true });
  }

  async clearCookies() {
    // await this.accountRef().update({ cookies: admin.firestore.FieldValue.delete() });
    await this.accountRef().set({ cookies: {} }, { merge: true });
  }

  async createAccountDoc({ data }) {
    const snapshot = await this.accountRef().get();

    if (snapshot.exists) {
      return;
    }

    log(`Creating account doc: ${this.username}`);
    await this.accountRef().set({ ...data });
  }

  async accountDetails() {
    const snapshot = await this.accountRef().get();

    if (snapshot.exists) {
      const data = snapshot.data();
      return { username: this.accountRef().id, ...data };
    } else {
      const message = `Account ${this.username} not found.`;
      log.error(message);
      throw new Error(message);
    }
  }

  async updateAccountDetails({ ...attrs }) {
    await this.accountRef().set(attrs, { merge: true });
  }

  accountRef() {
    return this.accountsCol().doc(this.username);
  }

  setUsername(username) {
    log(`Setting username to ${username}`);
    this.username = username;
  }
}

module.exports = DBManager;
