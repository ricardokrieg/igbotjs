const { defaultsDeep, last } = require('lodash');
const request = require('request-promise');
const { retry } = require('@lifeomic/attempt');
const { jar } = require('request');
const { MemoryCookieStore } = require('tough-cookie');
const cheerio = require('cheerio');
const debug = require('debug')('bot:dizu:api');

const defaultOptions = (cookieJar, headers) => {
  return {
    baseUrl: 'https://dizu.com.br',
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
  'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15`,
  'Accept-Language': `en-us`,
  'Accept-Encoding': `gzip`,
  'Connection': `keep-alive`,
  'X-Requested-With': `XMLHttpRequest`,
};

class DizuAPI {
  constructor() {
    this.cookieStore = new MemoryCookieStore();
    this.cookieJar = jar(this.cookieStore);

    // const cookies = `__cf_bm=218e455aaf6728028bce3a4d51c5b475b5913f96-1615464177-1800-AVcC+EwsmecInI/6RdVm7KX3RIGrSyrvjNrP8oMcvKaITZ6rKM6hosSZHi/ZkZmluJAhzPGqC4ArGsW7dqqePqlYHlrbxaAx9gkL78tqyAO/LcbEfzLAGgIOxmRCgovQIQ==; _ga=GA1.3.523335642.1615406726; _gat_gtag_UA_160075623_1=1; _gid=GA1.3.139030887.1615406726; crsftoken=a9b41123218245c10ee9ce888c56d533:e6764317a8c7f8490bf1e51fba2a10b6; __cfduid=db4c03bac499cfcfb473de40b502238f61615030609`;
    // const cookies = `_ga=GA1.3.523335642.1615406726; _gat_gtag_UA_160075623_1=1; _gid=GA1.3.19306637.1615776415; __cf_bm=0e60de321ede0a44e80949195917ca202d1093e4-1616676732-1800-AbWLlaSpLYy4NXUTwRNC0Amc3XsoBhUIlk+xyS6/vSiXI86lCdBhFS6j2y2RWXlzU5QEzRFYeR8X7dfABsdzbsHT8zx9lgsqURo4r7lUWTAt24IeTW+0MlbwsSwpwBeK2g==; crsftoken=e018c250f0b1ab32649a4e7d08fc0909:e4e946164ba6d6633da07549490e966f; __cfduid=db4c03bac499cfcfb473de40b502238f61615030609`;
	  const cookies = `__cfduid=d67c87f22941c4798da92da82a41ba6b71616677462; __cf_bm=bcef4b9acb7691c1aec0e02d36fb3b3144a7f05b-1616677464-1800-Aa0/X3xnOQum2EfA/K0VtCxTnQg5+dhQbx6bGFIcHOfQmvjeFgHJvfvuW9UKyzGmvF2stp03uPM6/9ozWSNCBNPLyvM7AxurLvK2CR1wh/BJg/ToXGdYPjksCooSwcjuiQ==; _ga=GA1.3.974360772.1616677466; _gid=GA1.3.308710921.1616677466; crsftoken=144c365f857d6269ff46d1bb11839927:a4035c207b3a75191370ff3db541487b; _gat_gtag_UA_160075623_1=1`;
    for (let cookie of cookies.split(`;`)) {
      this.cookieJar.setCookie(cookie, `https://dizu.com.br/`);
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

  async send(options) {
    return retry(async () => request(defaultsDeep({}, options, defaultOptions(this.cookieJar, headers))), this.attemptOptions);
  }

  async getTask(accountId) {
    const url = this.getTaskUrl(accountId);
    const response = await this.send({ url });

    const $ = cheerio.load(response.body);
    let data = null;

    await retry(async () => {
      try {
        const username        = last($('a#conectar_step_4').attr('href').split('/'));
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

  getTaskUrl(accountId) {
    return `/painel/listar_pedido/?&conta_id=${accountId}&twitter_id=Twitter&tiktok_id=TikTok&tarefa10=0&curtida05=0&acoesmg=0`;
  }
}

module.exports = DizuAPI;
