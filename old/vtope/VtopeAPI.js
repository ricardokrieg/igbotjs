const axios = require('axios');
const { retry } = require('@lifeomic/attempt');
const { sleep } = require('../old2/v2/utils/sleep');

const VTOPE_USER_ID = `5018924`;
const VTOPE_KEY     = `Rk5JnrXXr3pUOuwh`;
const VTOPE_UTOKEN  = `UhSzNaGpEgIpCavG`;
const VTOPE_BTOKEN  = `di86sDfWMsp3uSndgmd6a9Ffu3UltPcU`;

const client = axios.create({
  baseURL: 'https://vto.pe/botapi/'
});

client.defaults.params = {
  btoken: VTOPE_BTOKEN
};

const tasksClient = axios.create({
  baseURL: 'https://tasks.vto.pe/botapi/tasks/i/'
});

const attemptOptions = {
  maxAttempts: 100,
  delay: 3000,
  factor: 1.2,
  handleError: (error, context, options) => {
    console.error(error.response.data);
    console.error(context);
    console.error(options);
  }
};

class VtopeAPI {
  async request(url) {
    return this._request(client, url);
  }

  async taskRequest(url) {
    return await this._request(tasksClient, url);
  }

  async _request(_client, _url) {
    try {
      const response = await retry(async () => _client.get(_url), attemptOptions);
      return response.data;
    } catch(e) {
      console.error(e.message);
      throw e.response.data;
    }
  }

  async authorizeAccount({ id, username }) {
    return await this.request(`i/account?id=${id}&nick=${username}`);
  }

  async registerBot(device, program) {
    const response = await axios.get(
      `https://vto.pe/botapi/user?utoken=${VTOPE_UTOKEN}&device=${device}&program=${program}`
    );

    return Promise.resolve(response.data);
  }

  async accountData({ atoken }) {
    return await this.request(`i/account?atoken=${atoken}`);
  }

  async requestLike({ atoken }) {
    return await this.taskRequest(`like?atoken=${atoken}`);
  }

  async requestFollow({ atoken }) {
    return await this.taskRequest(`follow?atoken=${atoken}`);
  }

  async taskSuccess({ atoken, id }) {
    return await this._doneTask('ok', atoken, id);
  }

  async taskError({ atoken, id, errorType }) {
    if (!['doerror', 'taskerror'].includes(errorType)) {
      throw `Invalid error type: ${errorType}. Accepted values are 'doerror' and 'taskerror'`;
    }

    return await this._doneTask(errorType, atoken, id);
  }

  async _doneTask(doneType, atoken, id) {
    return await this.taskRequest(`done/${doneType}?atoken=${atoken}&id=${id}`);
  }
}

module.exports = VtopeAPI;
