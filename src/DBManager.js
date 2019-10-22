const { MongoClient } = require('mongodb');
const { logHandler } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);

class DBManager {
  constructor({ url, dbName, username }) {
    this.url      = url;
    this.dbName   = dbName;
    this.username = username;

    this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  }

  async connect() {
    log('Connecting...');

    await this.client.connect();

    log('Connected');
  }

  col({ colName }) {
    return this.client.db(this.dbName).collection(colName);
  }

  accountsCol() {
    return this.col({ colName: 'accounts' });
  }

  statsCol() {
    return this.col({ colName: 'stats' });
  }

  targetsCol() {
    return this.col({ colName: 'targets' });
  }

  uploadsCol() {
    return this.col({ colName: 'uploads' });
  }

  // this.dmsCol = client.db('igbotjs').collection('direct');
  // this.errorsCol = client.db('igbotjs').collection('errors');

  async updateCookiesAndState({ cookies, state }) {
    await this.accountsCol().updateOne(
      { _id: this.username },
      { $set: { cookies: cookies, state: state } },
      { upsert: true }
    );
  }

  async accountDetails() {
    const details = await this.accountsCol().findOne({ _id: this.username });

    if (details) {
      return details;
    } else {
      const message = `Account ${this.username} not found.`;
      log.error(message);
      throw new Error(message);
    }
  }

  async updateAccountDetails({ ...attrs }) {
    await this.accountsCol().updateOne(
      { _id: this.username },
      { $set: attrs },
      { upsert: false }
    );
  }

  async readAccountStartedAt() {
    const details = await this.accountsCol().findOne({ _id: this.username });

    if (details) {
      return details.startedAt;
    } else {
      const message = `Account ${this.username} not found.`;
      log.error(message);
      throw new Error(message);
    }
  }

  async readAccountLastRun() {
    const details = await this.accountsCol().findOne({ _id: this.username });

    if (details) {
      return details.lastRun;
    } else {
      const message = `Account ${this.username} not found.`;
      log.error(message);
      throw new Error(message);
    }
  }
}

module.exports = DBManager;
