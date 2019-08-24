const { IgApiClient } = require('instagram-private-api');
const { sample, filter, some, values, map, random } = require('lodash');
const { MongoClient } = require('mongodb');
const assert = require('assert').strict;
const moment = require('moment');


class Bot {
  constructor(username, proxy) {
    this.username = username;
    this.proxy = proxy;

    this.log('Username: ' + this.username);
    this.log('Proxy   : ' + this.proxy);

    this.ig = new IgApiClient();
    this.ig.state.proxyUrl = proxy;
    this.ig.request.end$.subscribe(this.requestSubscription.bind(this));

    this.col = null;

    this.cookies = null;
    this.state = null;
  }

  log(message) {
    console.log(`[${moment().format('LTS')}] ${JSON.stringify(message)}`);
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

  async start(sourceUsername, follows) {
    const client = new MongoClient('mongodb://wolf:xxx123xxx@ds243963.mlab.com:43963/igbotjs', { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    this.col = client.db('igbotjs').collection('accounts');
    this.log('Connected to database');

    this.log('Login Start');
    await this.login();
    this.log('Login End');

    this.log('Follow Start');
    await this.follow(sourceUsername, follows);
    this.log('Follow End');
  };

  async saveCookies(cookies) {
    await this.col.updateOne({ _id: this.username }, { $set: { cookies: cookies } });
  }

  async loadCookies() {
    this.log('Loading cookies...');

    this.cookies = (await this.col.findOne({ _id: this.username })).cookies;

    this.log('==> cookies');
    this.log(JSON.stringify(this.cookies));

    await this.ig.state.deserializeCookieJar(JSON.stringify(this.cookies));
  }

  async saveState(state) {
    await this.col.updateOne({ _id: this.username }, { $set: { state: state } });
  }

  async loadState() {
    this.log('Loading state...');

    this.state = (await this.col.findOne({ _id: this.username })).state;

    this.log('==> state');
    this.log(this.state);

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

    this.log('Simulating pre login flow...');
    await this.ig.simulate.preLoginFlow();

    this.log('Simulating post login flow...');
    this.ig.simulate.postLoginFlow();
  }

  async follow(sourceUsername, follows) {
    const source = await this.call((params) => { return this.ig.user.searchExact(params[0]) }, sourceUsername);
    this.log('Source:');
    this.log(source);

    this.log(`Fetching ${source.username}'s followers...`);
    const followersFeed = this.ig.feed.accountFollowers(source.pk);

    let page = 1;
    let followCount = 0;
    const followLimit = Math.round(random(follows - (follows * 0.5), follows + (follows * 0.5)));

    this.log(`Going to follow ${followLimit} users`);

    while (true) {
      if (followCount >= followLimit) {
        break;
      }

      this.log(`Page #${page}`);

      const items = await this.call((params) => { return params[0].items() }, followersFeed);

      const validUsers = filter(items, { 'is_private': false, 'is_verified': false, 'has_anonymous_profile_picture': false });
      this.log(`Fetched: ${items.length} users (valid: ${validUsers.length})`);

      const friendship = await this.call((params) => { return this.ig.friendship.showMany(map(params[0], 'pk')) }, validUsers);

      for (const user of validUsers) {
        this.log(`User: ${user.username}`);

        if (some(values(friendship[user.pk]))) {
          this.log(`Rejected (friendship status)`);
          continue;
        }

        await this.sleep(random(5000, 20000));

        const userInfo = await this.call((params) => { return this.ig.user.info(params[0].pk) }, user);
        if (userInfo.is_business) {
          this.log(`Rejected (business)`);
          continue;
        }

        this.log(`Following ${user.username}...`);
        this.log(userInfo);

        await this.call((params) => { return this.ig.friendship.create(params[0].pk) }, user);
        followCount++;
        this.log(`Followed ${user.username}`);

        this.log(`Follows: ${followCount}/${followLimit}`);

        if (followCount >= followLimit) {
          break;
        }
      }

    }

    this.log(`Followed ${followCount} users`);
  }

  sleep(ms) {
    this.log(`Sleeping ${ms}`);
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async call(command, ...params) {
    return new Promise(async (resolve, reject) => {
      let r;
      let tries = 0;
      while (true) {
        try {
          tries++;

          r = await command(params);

          break;
        } catch (err) {
          this.log(`Error: ${err}`);

          if (tries < 5) {
            await new Promise(resolve => setTimeout(resolve, 5000));
          } else {
            throw err;
          }
        }
      }

      resolve(r);
    });
  }
}

module.exports = Bot;
