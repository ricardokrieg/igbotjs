const axios = require('axios').default;
const { sleep } = require('../utils');

const SMS_SKI_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmN2U0MjdhOC1hZGFjLTRkNGUtYTEzOS02ODc4MmRiY2Q1OTEiLCJqdGkiOiIyMTAxNzU5MS0wN2ViLTRmZTgtYTFmNS1lMDRkNWQxYTFjNzgiLCJpYXQiOiIxNjAzMTk1ODYyIiwibmJmIjoxNjAzMTk1ODYyLCJleHAiOjE2MzQyOTk4NjIsImlzcyI6InNtcy5za2kiLCJhdWQiOiJSZWNlaXZlcnMifQ.s5sruyxK885-2zDH-0aPz7b-37cY5-UAe4pSv68vCtM';

const client = axios.create({
  baseURL: 'https://sms.ski/api/v1',
  headers: { 'Authorization': `Bearer ${SMS_SKI_API_KEY}` },
});

class SMSSkiApi {
  static async getNumber() {
    const phone_prefix = '+55';
    const iso = 'BR';

    try {
      const response = await client.get(`/receive/phone/${iso}/instagram/`);
      log(response);

      if (response.status !== 200) {
        log.error('Unable to get phone number');
        process.exit(1);
      }

      const phone_number = response.data.message.slice(phone_prefix.length - 1);

      return { phone_prefix, phone_number };
    } catch (e) {
      log.error(e.message);
      process.exit(1);
    }
  }

  static async getCode({ phone_prefix, phone_number }) {
    const phoneWithPrefix = `${phone_prefix}${phone_number}`.slice(1);

    while (true) {
      await sleep(10000);

      try {
        const response = await client.get(`/receive/code/${phoneWithPrefix}`);
        log(response);

        return response.data.message;
      } catch (e) {
        log(e.response);

        if (e.response.status !== 404) {
          log.error('Unable to get SMS code');
          process.exit(1);
        }
      }
    }
  }
}

module.exports = SMSSkiApi;