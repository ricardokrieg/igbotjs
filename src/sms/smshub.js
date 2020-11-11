const axios = require('axios').default;
const { isUndefined } = require('lodash');
const { sleep } = require('../utils');
const debug = require('debug')('bot:smshub');

const SMS_HUB_API_KEY = '52283U8c6238866021a16f14ac13f7da8ec3d9';

const client = axios.create({
  baseURL: 'https://smshub.org/stubs/',
});
client.defaults.params = {}
client.defaults.params['api_key'] = SMS_HUB_API_KEY;

let activationId;

class SMSHubApi {
  static async getNumber(countryId) {
    if (isUndefined(countryId)) {
      countryId = 2; // 0 - Russia, 1 - Ucrânia, 2 - Cazaquistão
    }

    try {
      const response = await client.get(
        `handler_api.php?action=getNumber&service=ig&country=${countryId}`
      );
      debug(response.data);

      const phone_number = response.data.split(':')[2];
      activationId = response.data.split(':')[1];

      return phone_number;
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  }

  static async getCode() {
    while (true) {
      await sleep(10000);

      try {
        const response = await client.get(
          `handler_api.php?action=getStatus&id=${activationId}`
        );
        debug(response.data);

        if (response.data === 'STATUS_WAIT_CODE') {
          // do nothing
        } else if (response.data.startsWith('STATUS_WAIT_RETRY')) {
          // do nothing
        } else if (response.data === 'STATUS_CANCEL') {
          console.error('SMS canceled');
          process.exit(1);
        } else {
          return response.data.split(':')[1];
        }
      } catch (e) {
        console.error(e.response);
        process.exit(1);
      }
    }
  }
}

module.exports = SMSHubApi;