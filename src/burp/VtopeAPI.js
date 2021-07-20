const { defaultsDeep } = require('lodash');
const request = require('request-promise');
const { retry } = require('@lifeomic/attempt');
const debug = require('debug')('bot:vtope:api');

class VtopeAPI {
  constructor() {
    this.utoken = `UhSzNaGpEgIpCavG`;
    this.btoken = `nvpcbsFllv5sxGyZCZL6iEjaIpBkPxfd`;
  }

  async send(options = {}) {
    options.qs = {
      btoken: this.btoken,
      ...options.qs,
    };

    const response = await retry(async () => request(defaultsDeep(options, { baseUrl: `https://vto.pe/botapi` })), this.attemptOptions);

    return Promise.resolve(JSON.parse(response));
  }

  async registerBot() {
    const qs = {
      utoken: this.utoken,
      device: `osx`,
      program: `js`,
    };

    const response = await this.send({ uri: `/user`, qs });
    debug(response);

    return Promise.resolve(response);
  }

  async updateBot() {
    const qs = {
      tasks: JSON.stringify({ '21': false, '161': true, '5': true, '17': false, '168': true, '6': false, '7': false, '3': false, '169': false }),
    };

    const response = await this.send({ uri: `/settasks`, qs });
    debug(response);

    return Promise.resolve(response);
  }

  async userInfo() {
    const response = await this.send({ uri: `/user` });
    debug(response);

    return Promise.resolve(response);
  }

  async addAccount(username, id) {
    const qs = {
      id,
      nick: username,
    };

    const response = await this.send({ uri: `/i/account`, qs });
    debug(response);

    return Promise.resolve(response);
  }

  async accountInfo(atoken) {
    const qs = {
      atoken,
    };

    const response = await this.send({ uri: `/i/account`, qs });
    debug(response);

    return Promise.resolve(response);
  }

  async getTask(atoken) {
    const qs = {
      atoken,
    };

    const response = await this.send({ baseUrl: `https://tasks.vto.pe/botapi/`, uri: `tasks/i/follow`, qs });
    debug(response);

    return Promise.resolve(response);
  }

  async submitTask(taskId, atoken) {
    const qs = {
      atoken,
      id: taskId,
    };

    const response = await this.send({ baseUrl: `https://tasks.vto.pe/botapi/`, uri: `tasks/i/done/ok`, qs });
    debug(response);

    return Promise.resolve(response);
  }

  async skipTask(taskId, atoken) {
    const qs = {
      atoken,
      id: taskId,
    };

    const response = await this.send({ baseUrl: `https://tasks.vto.pe/botapi/`, uri: `tasks/i/done/doerror`, qs });
    debug(response);

    return Promise.resolve(response);
  }
}

module.exports = VtopeAPI;
