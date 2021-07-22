const request = require('request-promise');
const debug = require('debug')('bot:sms');

const {sleep} = require('./utils');

class SMSHubService {
  constructor() {
    this.apiKey = `52283U8c6238866021a16f14ac13f7da8ec3d9`;
    this.countryIndex = 0;
    this.prefix = `+7`;
    this.currentNumber = null;
  }

  async getPrefix() {
    return Promise.resolve(this.prefix);
  }

  async getPhoneNumber() {
    this.currentNumber = await this.getNumber();

    return Promise.resolve(this.currentNumber.number.replace(this.prefix.replace('+', ''), ''));
  }

  async getVerificationCode() {
    const code = await this.waitForCode(this.currentNumber.id);

    return Promise.resolve(code);
  }

  async getBalance() {
    const url = `https://smshub.org/stubs/handler_api.php?api_key=${this.apiKey}&action=getBalance`;
    const response = await request.get(url);

    debug(response);

    const match = /ACCESS_BALANCE:(.*)/.exec(response);

    return Promise.resolve(parseFloat(match[1]));
  }

  async getNumber() {
    const url = `https://smshub.org/stubs/handler_api.php?api_key=${this.apiKey}&action=getNumber&service=ig&country=${this.countryIndex}`;
    const response = await request.get(url);

    debug(response);

    const match = /ACCESS_NUMBER:(\d+):(\d+)/.exec(response);

    return Promise.resolve({ id: match[1], number: match[2] });
  }

  async getStatus(id) {
    const url = `https://smshub.org/stubs/handler_api.php?api_key=${this.apiKey}&action=getStatus&id=${id}`;
    const response = await request.get(url);

    debug(response);

    return Promise.resolve(response);
  }

  async waitForCode(id) {
    let tries = 7;

    while (tries > 0) {
      const status = await this.getStatus(id);

      const match = /STATUS_OK:(\d+)/.exec(status);

      if (match) {
        return Promise.resolve(match[1]);
      }

      await sleep(30000);
      tries--;
    }

    await this.setStatusCancel();
    return Promise.reject(new Error(`SMS didn't arrive`));
  }

  async setStatus(id, status) {
    const url = `https://smshub.org/stubs/handler_api.php?api_key=${this.apiKey}&action=setStatus&status=${status}&id=${id}`;
    const response = await request.get(url);

    debug(response);

    return Promise.resolve(response);
  }

  async setStatusReady() {
    return this.setStatus(this.currentNumber.id, `1`);
  }

  async setStatusDone() {
    return this.setStatus(this.currentNumber.id, `6`);
  }

  async setStatusCancel() {
    return this.setStatus(this.currentNumber.id, `8`);
  }
}

module.exports = SMSHubService;
