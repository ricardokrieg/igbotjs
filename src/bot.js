const { IgApiClient } = require('instagram-private-api');
const { sampleSize, sample, includes, filter, some, values, map, random } = require('lodash');
const { MongoClient } = require('mongodb');
const moment = require('moment');
const Spinner = require('node-spintax');
const fs = require('fs');

const { call, logger, greetingMessage, quickSleep, longSleep, stats } = require('./utils');
const { feed } = require('./actions/feed');
const { dmFollowers, inbox, sendMessage } = require('./actions/direct');
const { follow } = require('./actions/follow');
const { publish } = require('./actions/publish');
const { stories } = require('./actions/stories');
const { comment } = require('./actions/comment');

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
    this.uploadsCol = null;
    this.statsCol = null;
    this.errorsCol = null;

    this.accountDetails = null;

    this.cookies = null;
    this.state = null;
  }

  async start() {
    log('Start');

    await this.setup();

    const { ig, targetsCol, dmsCol, uploadsCol, statsCol, errorsCol } = this;
    const accountDetails = this.accountDetails;

    for (let n of sampleSize([1, 2, 3, 4, 5], 100)) {
      switch(n) {
        case 1:
          await feed({ ig, accountDetails, statsCol, errorsCol });
          break;
        case 2:
          await follow({ ig, accountDetails, targetsCol, statsCol, errorsCol });
          break;
        case 3:
          await dmFollowers({ ig, accountDetails, dmsCol, statsCol, errorsCol });
          break;
        case 4:
          await publish({ ig, accountDetails, uploadsCol, statsCol, errorsCol });
          break;
        case 5:
          await stories({ ig, statsCol, errorsCol });
          break;
      }
    }

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
    this.uploadsCol = client.db('igbotjs').collection('uploads');
    this.statsCol = client.db('igbotjs').collection('stats');
    this.errorsCol = client.db('igbotjs').collection('errors');
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

  async sendDM({ target }) {
    await this.setup();
    const spinner = new Spinner(this.accountDetails.message);

    log(`DMing ${target}`);

    const targetPk = await this.ig.user.getIdByUsername(target);

    const thread = this.ig.entity.directThread([targetPk.toString()]);

    await call(() => { thread.broadcastText(greetingMessage()) });
    await quickSleep();

    const message = spinner.unspinRandom(1)[0];
    await call(() => { thread.broadcastText(message) });

    log('Done');
  }

  async editProfile({ newUsername, name, bio, url, profilePic }) {
    await this.setup();

    const currentUser = await this.ig.account.currentUser();
    log(currentUser);

    let options = {
      external_url: url,
      gender: currentUser.gender,
      phone_number: '',
      username: newUsername,
      first_name: name,
      biography: bio,
      email: currentUser.email,
    };
    log('Options:');
    log(options);

    log('Editing profile...');
    let result = await call(() => { return this.ig.account.editProfile(options) });
    log(result);

    log('Changing profile picture...');
    const readStream = fs.createReadStream(profilePic);
    result = await call(() => { return this.ig.account.changeProfilePicture(readStream) });
    log(result);

    log('Done');
  }

  // async comment() {
  //   await this.setup();
  //
  //   const usernames = [
  //     '_garotafit.oficial',
  //     '_gata.fit_',
  //     'gatinhajuhhhh',
  //   ];
  //   const comments = [
  //     '😍 bjs',
  //     'bjs 😍 ',
  //     'beijinhos',
  //     'amei',
  //     'wow',
  //     'uau',
  //   ];
  //
  //   for (let i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
  //   for (let username of usernames) {
  //     const targetPk = await this.ig.user.getIdByUsername(username);
  //     const userFeed = this.ig.feed.user(targetPk);
  //
  //     const myPostsFirstPage = await userFeed.items();
  //
  //     const result = await call(() => {
  //       return this.ig.media.comment({
  //         mediaId: sample(myPostsFirstPage).id,
  //         text: sample(comments),
  //       });
  //     });
  //     await stats(this.statsCol, this.accountDetails._id, 'comment', username);
  //     log(result);
  //
  //     longSleep();
  //   }
  //   }
  //
  //   log('Done');
  // }
}

module.exports = Bot;
