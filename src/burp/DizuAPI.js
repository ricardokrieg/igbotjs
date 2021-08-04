const querystring = require("querystring");
const { defaultsDeep, last } = require('lodash');
const request = require('request-promise');
const { retry } = require('@lifeomic/attempt');
const { jar } = require('request');
const { MemoryCookieStore } = require('tough-cookie');
const cheerio = require('cheerio');
const debug = require('debug')('bot:dizu:api');
const {sleep} = require('./utils');

const defaultOptions = (cookieJar, headers) => {
  return {
    baseUrl: 'https://51.222.154.230/',
    jar: cookieJar,
    gzip: true,
    headers: headers,
    method: 'GET',
    resolveWithFullResponse: true,
  }
};

const headers = {
  'Accept': `*/*`,
  'Host': `dizu.com.br`,
  'User-Agent': `Mozilla/5.0 (iPhone; U; CPU iPhone OS 11_3_4 like Mac OS X; en-IN) AppleWebKit/604.4.8 (KHTML, like Gecko) Version/12.0.1 Mobile/8C390 Safari/6533.18.5`,
  'Accept-Language': `pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7`,
  'Accept-Encoding': `gzip`,
  'Connection': `keep-alive`,
  'X-Requested-With': `XMLHttpRequest`,
  'cache-control': `no-cache`,
  'pragma': `no-cache`,
  'sec-ch-ua': `"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"`,
  'sec-ch-ua-mobile': `?0`,
  'sec-fetch-dest': `empty`,
  'sec-fetch-mode': `cors`,
  'sec-fetch-site': `same-origin`,
};

class DizuAPI {
  constructor() {
    this.cookieStore = new MemoryCookieStore();
    this.cookieJar = jar(this.cookieStore);

    const cookies = `crsftoken=58542c443c6ad4de84292213dfe98426:aac62446a8a096242a17ff0af259817c`;
    for (let cookie of cookies.split(`;`)) {
      this.cookieJar.setCookie(cookie, `https://dizu.com.br/`);
      this.cookieJar.setCookie(cookie, `https://51.222.154.230/`);
    }

    this.attemptOptions = {
      maxAttempts: 100,
      delay: 3000,
      factor: 1.2,
      handleError: (error, context, options) => {
        console.error(error);
        console.error(context);
        console.error(options);
      }
    };
  }

  getCode() {
    return `815904`;
  }

  async send(options) {
    return retry(async () => request(defaultsDeep({}, options, defaultOptions(this.cookieJar, headers))), this.attemptOptions);
  }

  async addAccount(username) {
    // fetch("https://dizu.com.br/painel/cadastrar_conta", {
    //   "headers": {
    //     "accept": "*/*",
    //     "accept-language": "en-US,en;q=0.9",
    //     "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    //     "sec-fetch-dest": "empty",
    //     "sec-fetch-mode": "cors",
    //     "sec-fetch-site": "same-origin",
    //     "sec-gpc": "1",
    //     "x-requested-with": "XMLHttpRequest",
    //     "cookie": "crsftoken=58542c443c6ad4de84292213dfe98426:aac62446a8a096242a17ff0af259817c"
    //   },
    //   "referrerPolicy": "no-referrer",
    //   "body": "site=1&conta=jessicadiniz312&gender=2&perfil_texto=815904&conta20=1&recaptcha_token=03AGdBq24X6NlRIUdOC3qMBxlvr5fwQt5Wwu6PZFQRcTNdGxpxTuxPSCWX-kY6WaTgx4T7D5-XPtgsvaWVKqhVT3F5YRaxW4emYytniq1fWsXcC6jEQB9Kkzly3IuRKfjM-U4L2EdaaHTlPnog8p0PVN23DfBoPdxJ9itDxg1bLDC-Q_he9C21nz1Dh-GFzVan7u9JcO9d4dcpjOCphvGK_3jodsG8xoyPgbbBYINdn4UcxK_Y_esTeZ7kbK-O26xCrwsu8FXobSuYIWVwvbPZxSgqPGhaovL3o7ZBcy_wF8IRXrcQS9aPc6P_iWOW3INJHH1Z7cCwD9kB-M6Yhb8zJUs-g6WuUa85h4ldBPxdbE6aMxZBTfZrH4yhFfvOyqzJvRqZ-SL4x8MFapGhOcOjxVeRzdCeyaRv2gJMDClVwejsBTFHbiHvC6c",
    //   "method": "POST",
    //   "mode": "cors"
    // });

    // const body = querystring.stringify({
    //   site: 1,
    //   conta: username,
    //   gender: 2,
    //   perfil_texto: `815904`,
    //   conta20: 1,
    // });

    const form = {
      site: 1,
      conta: username,
      gender: 2,
      perfil_texto: `815904`,
      conta20: 1,
    };

    const response = await this.send({ url: `/painel/cadastrar_conta`, method: `POST`, form });
    debug(response.body);
    return response.body;
  }

  async getTask(accountId) {
    let data = null;
    let response = null;

    await retry(async () => {
      try {
        const url = this.getTaskUrl(accountId);
        response = await this.send({ url });

        const $ = cheerio.load(response.body);
        const link = $('a#conectar_step_4').attr('href');

        if (!link) {
          console.error(`Dizu returned invalid response`);
          console.error(response.body);
          await sleep(10000);
          return;
        }

        if (link.includes(`/p/`)) {
          console.error(`Dizu returned a LIKE task`);
          console.error(link);

          const connectFormId = $('#conectar_form_id').attr('value');
          if (connectFormId) {
            debug(`Rejecting LIKE task`);
            await this.skipTask(connectFormId, accountId);
          }

          return;
        }

        const username        = last(link.split('/'));
        const connectFormId   = $('#conectar_form_id').attr('value');
        const accountIdAction = $('#conta_id_acao').attr('value');

        data = {
          username,
          connectFormId,
          accountIdAction,
        };

        debug(data);
      } catch (e) {
        console.log(response);

        throw e;
      }
    }, this.attemptOptions);

    return data;
  }

  async submitTask(taskId, accountId) {
    const form = {
      tarefa_token: null,
      tarefa_id: taskId,
      conta_id: accountId,
      realizado: 1,
    };

    const response = await this.send({ url: '/painel/confirmar_pedido', method: 'POST', form });
    debug(response.body);
    return response.body;
  }

  async skipTask(taskId, accountId) {
    const form = {
      tarefa_token: null,
      tarefa_id: taskId,
      conta_id: accountId,
      realizado: 3,
    };

    const response = await this.send({ url: '/painel/confirmar_pedido', method: 'POST', form });
    debug(response.body);
    return response.body;
  }

  getTaskUrl(accountId) {
    return `/painel/listar_pedido/?&conta_id=${accountId}&twitter_id=Twitter&tiktok_id=TikTok&tarefa10=0&curtida05=0&acoesmg=0`;
  }
}

module.exports = DizuAPI;
