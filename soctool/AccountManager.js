const { isUndefined, map } = require('lodash');
const moment = require('moment');
const debug = require('debug')('bot:soctool:AccountManager');

const firebase = require('firebase');
require('firebase/firestore');

const admin = require('firebase-admin');
const serviceAccount = require('../src/serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://instagram-bot-js.firebaseio.com'
});

const firestore = admin.firestore();

class AccountManager {
  constructor(username, authorizeCommand) {
    this.username = username;
    this.authorizeCommand = authorizeCommand;
  }

  async loadAttrs() {
    const snapshot = await this.accountRef().get();

    if (!snapshot.exists) {
      throw `Account ${this.username} not found!`;
    }

    this.attrs = snapshot.data();
    debug(this.attrs);

    if (isUndefined(this.attrs.atoken)) {
      const atoken = await this.authorizeCommand(this.attrs.userId, this.attrs.username);
      await this.saveAttrs({ atoken });
    }
  }

  async saveAttrs(attrs) {
    this.attrs = { ...this.attrs, ...attrs };

    return this.accountRef().set(this.attrs, { merge: true });
  }

  async calculateStage() {
    let momentDate;
    if (isUndefined(this.attrs.createdAt)) {
      this.attrs.createdAt = new Date();
      momentDate = moment(this.attrs.createdAt);
    } else {
      momentDate = moment(this.attrs.createdAt.toDate());
    }

    this.attrs.day = moment().diff(momentDate, 'days') + 1;
    await this.saveAttrs({});
  }

  async saveAction(data) {
    return AccountManager.actionsCol().doc().create({ ...data, username: this.username, timestamp: new Date() });
  }

  accountRef() {
    return AccountManager.accountsCol().doc(this.username);
  }

  static accountsCol() {
    return firestore.collection('vtope_accounts');
  }

  static actionsCol() {
    return firestore.collection('vtope_actions');
  }

  async actionsToday() {
    const query = AccountManager.actionsCol()
      .where('username', '==', this.username)
      .where('timestamp', '>', moment().startOf('day'))
      .where('timestamp', '<', moment().endOf('day'));
    const snapshot = await query.get();

    return snapshot.size;
  }

  static async allUsernames() {
    const docs = (await this.accountsCol().select('username').get()).docs;
    return map(docs, (doc) => doc.get('username'))
  }

  static async import(record) {
    const [ username, password ] = record.credentials.split(`:`);
    const userAgent = record.userAgent;
    const [ deviceId, uuid, phoneId, adId ] = record.device.split(`;`);
    const cookies = record.cookies;
    const [ proxyType, proxyHost, proxyPort, proxyLogin, proxyPassword ] = record.proxy.split(`:`);

    const userId = /.*?ds_user_id=(\d+).*?/.exec(cookies)[1];
    const proxy = `${proxyType}://${proxyLogin}:${proxyPassword}@${proxyHost}:${proxyPort}`;

    debug(`Username: ${username}`);
    debug(`Password: ${password}`);
    debug(`User ID: ${userId}`);
    debug(`User Agent: ${userAgent}`);
    debug(`Device ID: ${deviceId}`);
    debug(`UUID: ${uuid}`);
    debug(`phone ID: ${phoneId}`);
    debug(`AD ID: ${adId}`);
    debug(`Cookies: ${cookies}`);
    debug(`Proxy: ${proxy}`);

    const accountManager = new AccountManager(username);
    const snapshot = await accountManager.accountRef().get();

    if (snapshot.exists) {
      throw `Account ${username} already exists!`;
    }

    return accountManager.accountRef().create({ username, password, userId, userAgent, deviceId, uuid, phoneId, adId, cookies, proxy });
  }
}

module.exports = AccountManager;