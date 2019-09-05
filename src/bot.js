const { IgApiClient } = require('instagram-private-api');
const { includes, filter, some, values, map, random } = require('lodash');
const { MongoClient } = require('mongodb');
const moment = require('moment');

const { logger } = require('./utils');
const { feed } = require('./actions/feed');
const { dmFollowers, inbox, sendMessage } = require('./actions/direct');
const { follow } = require('./actions/follow');

const log = (message) => logger('Bot', message);


class Bot {
  constructor({ username }) {
    this.username = username;

    log('Username: ' + this.username);

    this.ig = new IgApiClient();
    this.ig.request.end$.subscribe(this.requestSubscription.bind(this));

    this.accountsCol = null;
    this.targetsCol = null;
    this.dmsCol = null;

    this.accountDetails = null;

    this.cookies = null;
    this.state = null;
  }

  async start() {
    log('Start');

    await this.setup();

    const { ig, targetsCol, dmsCol } = this;
    const accountDetails = this.accountDetails;

    await feed({ ig, accountDetails });
    await follow({ ig, accountDetails, targetsCol });
    await dmFollowers({ ig, accountDetails, dmsCol });

    log('End');
  }

  async requestSubscription() {
    const cookies = await this.ig.state.serializeCookieJar();
    const state = {
      deviceString: this.ig.state.deviceString,
      deviceId: this.ig.state.deviceId,
      uuid: this.ig.state.uuid,
      phoneId: this.ig.state.phoneId,
      adid: this.ig.state.adid,
      build: this.ig.state.build,
    };

    await this.accountsCol.updateOne({ _id: this.username }, { $set: { cookies: cookies, state: state } }, { upsert: true });
  }

  async connectToDatabase() {
    const client = new MongoClient('mongodb://wolf:xxx123xxx@ds243963.mlab.com:43963/igbotjs', { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    this.accountsCol = client.db('igbotjs').collection('accounts');
    this.targetsCol = client.db('igbotjs').collection('targets');
    this.dmsCol = client.db('igbotjs').collection('direct');
    log('Connected to database');

    this.accountDetails = await this.accountsCol.findOne({ _id: this.username });
    log(this.accountDetails);

    this.ig.state.proxyUrl = this.accountDetails.proxy;
    log('Proxy: ' + this.accountDetails.proxy);
  }

  async setup() {
    await this.connectToDatabase();
    await this.login();
  }

  async saveCookies(cookies) {
    await this.accountsCol.updateOne({ _id: this.username }, { $set: { cookies: cookies } }, { upsert: true });
  }

  async loadCookies() {
    log('Loading cookies...');

    this.cookies = (await this.accountsCol.findOne({ _id: this.username })).cookies;

    log('==> cookies');
    log(this.cookies);

    await this.ig.state.deserializeCookieJar(JSON.stringify(this.cookies));
  }

  async saveState(state) {
    await this.accountsCol.updateOne({ _id: this.username }, { $set: { state: state } }, { upsert: true });
  }

  async loadState() {
    log('Loading state...');

    this.state = (await this.accountsCol.findOne({ _id: this.username })).state;

    log('==> state');
    log(this.state);

    this.ig.state.deviceString = this.state.deviceString;
    this.ig.state.deviceId = this.state.deviceId;
    this.ig.state.uuid = this.state.uuid;
    this.ig.state.phoneId = this.state.phoneId;
    this.ig.state.adid = this.state.adid;
    this.ig.state.build = this.state.build;
  }

  async login() {
    log('Login Start');

    await this.loadCookies();
    await this.loadState();

    log('Simulating pre login flow...');
    await this.ig.simulate.preLoginFlow();

    log('Simulating post login flow...');
    await this.ig.simulate.postLoginFlow();

    log('Login End');
  }

  async checkInbox() {
    await this.setup();
    await inbox({ ig: this.ig });
  }

  async sendDM({ target, message }) {
    await this.setup();
    await sendMessage({ ig: this.ig, target, message });
  }
}

module.exports = Bot;
