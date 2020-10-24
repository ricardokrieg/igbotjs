const axios = require('axios').default;
const { sleep } = require('../utils');

const SMS_HUB_API_KEY = '52283U8c6238866021a16f14ac13f7da8ec3d9';

const client = axios.create({
  baseURL: 'https://smshub.org/stubs/',
});
client.defaults.params = {}
client.defaults.params['api_key'] = SMS_HUB_API_KEY;

let activationId;

class SMSHubApi {
  static async getNumber() {
    const phone_prefix = '+55';
    const countryId = 73; // 0 - Russia, 73 - Brazil

    try {
      const response = await client.get(
        `handler_api.php?action=getNumber&service=ig&country=${countryId}`
      );
      log(response);

      const phone_with_prefix = response.data.split(':')[2];
      const phone_number = phone_with_prefix.slice(phone_prefix.length - 1);
      activationId = response.data.split(':')[1];

      return { phone_prefix, phone_number };
    } catch (e) {
      log.error(e.message);
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
        log(response);

        if (response.data === 'STATUS_WAIT_CODE') {
          // do nothing
        } else if (response.data.startsWith('STATUS_WAIT_RETRY')) {
          // do nothing
        } else if (response.data === 'STATUS_CANCEL') {
          log.error('SMS canceled');
          process.exit(1);
        } else {
          return response.data.split(':')[1];
        }
      } catch (e) {
        log(e.response);
        process.exit(1);
      }
    }
  }
}

module.exports = SMSHubApi;