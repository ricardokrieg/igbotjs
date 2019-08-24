const { IgApiClient } = require('instagram-private-api');
const { sample, filter, some, values, map, random } = require('lodash');
const { MongoClient } = require('mongodb');
const assert = require('assert').strict;


class Bot {
  constructor(username, proxy) {
    this.username = username;
    this.proxy = proxy;

    console.log('Username: ' + this.username);
    console.log('Proxy   : ' + this.proxy);

    this.ig = new IgApiClient();
    this.ig.state.proxyUrl = proxy;
    this.ig.request.end$.subscribe(this.requestSubscription.bind(this));

    this.col = null;

    this.cookies = null;
    this.state = null;
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

  async start(sourceUsername) {
    const client = new MongoClient('mongodb://wolf:xxx123xxx@ds243963.mlab.com:43963/igbotjs', { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    this.col = client.db('igbotjs').collection('accounts');
    console.log('Connected to database');

    console.log('Login Start');
    await this.login();
    console.log('Login End');

    console.log('Follow Start');
    await this.follow(sourceUsername);
    console.log('Follow End');
  };

  async saveCookies(cookies) {
    await this.col.updateOne({ _id: this.username }, { $set: { cookies: cookies } });
  }

  async loadCookies() {
    console.log('Loading cookies...');

    this.cookies = (await this.col.findOne({ _id: this.username })).cookies;

    console.log('==> cookies');
    console.log(JSON.stringify(this.cookies));

    await this.ig.state.deserializeCookieJar(JSON.stringify(this.cookies));
  }

  async saveState(state) {
    await this.col.updateOne({ _id: this.username }, { $set: { state: state } });
  }

  async loadState() {
    console.log('Loading state...');

    this.state = (await this.col.findOne({ _id: this.username })).state;

    console.log('==> state');
    console.log(this.state);

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

    console.log('Simulating pre login flow...');
    await this.ig.simulate.preLoginFlow();

    console.log('Simulating post login flow...');
    this.ig.simulate.postLoginFlow();
  }

  async follow(sourceUsername) {
    const source = await this.ig.user.searchExact(sourceUsername);
    console.log('Source:');
    console.log(source);

    console.log(`Fetching ${source.username}'s followers...`);
    const followersFeed = this.ig.feed.accountFollowers(source.pk);

    let page = 1;
    let followCount = 0;
    const followLimit = 10;
    while (true) {
      if (followCount >= followLimit) {
        break;
      }

      console.log(`Page #${page}`);

      const items = await followersFeed.items();

      const validUsers = filter(items, { 'is_private': false, 'is_verified': false, 'has_anonymous_profile_picture': false });
      console.log(`Fetched: ${items.length} users (valid: ${validUsers.length})`);

      const friendship = await this.ig.friendship.showMany(map(validUsers, 'pk'));

      for (const user of validUsers) {
        if (some(values(friendship[user.pk]))) {
          continue;
        }

        await this.sleep(random(5000, 20000));

        const userInfo = await this.ig.user.info(user.pk);
        if (userInfo.is_business) {
          continue;
        }

        console.log(`Following ${user.username}...`);
        console.log(userInfo);
        console.log(friendship[user.pk]);

        this.ig.friendship.create(user.pk);
        followCount++;

        if (followCount >= followLimit) {
          break;
        }
      }

    }

    console.log(`Followed ${followCount} users`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  call(command) {
    let tries = 0;

    while (true) {
      try {
        tries++;

        command();

        break;
      } catch (err) {
        console.log(`Error: ${err}`);

        if (tries < 5) {
          const sleepTime = random(5000, 10000);
          console.log(`Command failed on try #${tries}. Sleep ${sleepTime} seconds`);
          sleep(sleepTime);
        } else {
          throw err;
        }
      }
    }
  }
}

module.exports = Bot;
