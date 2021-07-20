const request = require('request-promise');
const debug = require('debug')('bot:subscription');

const {sleep} = require('./utils');

class SubscriptionService {
  constructor() {
    this.apiKey = `ddd80ace10f9a616ad8bc123c4471176`;
  }

  async balance() {
    return this.send(`balance`);
  }

  async services() {
    return this.send(`services`);
  }

  async order(target) {
    const url = `https://justanotherpanel.com/api/v2`;
    const form = {
      key: this.apiKey,
      action: `add`,
      service: `3456`,
      link: `https://instagram.com/${target}`,
      quantity: 35,
    };

    const response = JSON.parse(await request.post(url, { form }));

    debug(response);

    return Promise.resolve(response);
  }

  async status(orderId) {
    const url = `https://justanotherpanel.com/api/v2`;
    const form = {
      key: this.apiKey,
      action: `status`,
      order: orderId,
    };

    const response = JSON.parse(await request.post(url, { form }));

    debug(response);

    return Promise.resolve(response);
  }

  async send(action) {
    const url = `https://justanotherpanel.com/api/v2`;
    const form = {
      key: this.apiKey,
      action,
    };

    const response = JSON.parse(await request.post(url, { form }));

    debug(response);

    return Promise.resolve(response);
  }
}

module.exports = SubscriptionService;
