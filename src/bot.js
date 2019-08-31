const { IgApiClient } = require('instagram-private-api');
const { includes, filter, some, values, map, random } = require('lodash');
const { MongoClient } = require('mongodb');
const assert = require('assert').strict;
const moment = require('moment');

const { logger } = require('./utils');
const { follow } = require('./actions/follow');

const log = (message) => logger('Bot', message);


class Bot {
  constructor(username, proxy) {
    this.username = username;
    this.proxy = proxy;

    log('Username: ' + this.username);
    log('Proxy   : ' + this.proxy);

    this.ig = new IgApiClient();
    this.ig.state.proxyUrl = proxy;
    this.ig.request.end$.subscribe(this.requestSubscription.bind(this));

    this.col = null;
    this.targetsCol = null;

    this.cookies = null;
    this.state = null;
  }

  async start({ follows }) {
    log('Start');
    log(`Follows: ${follows}`);

    await this.setup();

    const { ig, targetsCol } = this;

    await follow({ ig, targetsCol, follows });

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

    this.saveCookies(cookies);
    this.saveState(state);
  }

  async setup() {
    const client = new MongoClient('mongodb://wolf:xxx123xxx@ds243963.mlab.com:43963/igbotjs', { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    this.col = client.db('igbotjs').collection('accounts');
    this.targetsCol = client.db('igbotjs').collection('targets');
    log('Connected to database');

    log('Login Start');
    await this.login();
    log('Login End');
  }

  async saveCookies(cookies) {
    await this.col.updateOne({ _id: this.username }, { $set: { cookies: cookies } }, { upsert: true });
  }

  async loadCookies() {
    log('Loading cookies...');

    this.cookies = (await this.col.findOne({ _id: this.username })).cookies;

    log('==> cookies');
    log(this.cookies);

    await this.ig.state.deserializeCookieJar(JSON.stringify(this.cookies));
  }

  async saveState(state) {
    await this.col.updateOne({ _id: this.username }, { $set: { state: state } }, { upsert: true });
  }

  async loadState() {
    log('Loading state...');

    this.state = (await this.col.findOne({ _id: this.username })).state;

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
    await this.loadCookies();
    await this.loadState();

    log('Simulating pre login flow...');
    await this.ig.simulate.preLoginFlow();

    log('Simulating post login flow...');
    await this.ig.simulate.postLoginFlow();
  }
}

module.exports = Bot;
