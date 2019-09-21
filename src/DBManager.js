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
    return this.col('accounts');
  }

  statsCol() {
    return this.col('stats');
  }

  targetsCol() {
    return this.col('targets');
  }

  // this.targetsCol = client.db('igbotjs').collection('targets');
  // this.dmsCol = client.db('igbotjs').collection('direct');
  // this.uploadsCol = client.db('igbotjs').collection('uploads');
  // this.errorsCol = client.db('igbotjs').collection('errors');

  async accountDetails() {
    return await this.accountsCol().findOne({ _id: this.username });
  }

  async updateCookiesAndState({ cookies, state }) {
    await this.accountsCol().updateOne(
      { _id: this.username },
      { $set: { cookies: cookies, state: state } },
      { upsert: true }
    );
  }
}

module.exports = DBManager;
