const axios = require('axios');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const client = axios.create({
  baseURL: 'https://instagram.com/',
  // headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36' },
  headers: {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-language": "pt-BR,pt;q=0.9",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "cookie": "ig_did=0D2E054C-275B-4FC6-B63F-7F609762DBE2; ig_nrcb=1; csrftoken=4g2BAJoTTZP3c5lBbBQsJYl7Qh8UzyH0; mid=X6tCWwALAAHL3r0IPzxWzTsMfj9T; urlgen=\"{\\\"2804:1b2:a886:e91f:c90d:ff7a:9277:ce63\\\": 18881\\054 \\\"179.240.169.88\\\": 22085}:1kch4g:emJfL89oCZg_fSFAkDnw3bJOCio\""
  },
});

(async () => {
  try {
    const response = await fetch("https://www.instagram.com/brunamarquezine/", {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "pt-BR,pt;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "ig_did=0D2E054C-275B-4FC6-B63F-7F609762DBE2; ig_nrcb=1; csrftoken=4g2BAJoTTZP3c5lBbBQsJYl7Qh8UzyH0; mid=X6tCWwALAAHL3r0IPzxWzTsMfj9T; urlgen=\"{\\\"2804:1b2:a886:e91f:c90d:ff7a:9277:ce63\\\": 18881\\054 \\\"179.240.169.88\\\": 22085}:1kch4g:emJfL89oCZg_fSFAkDnw3bJOCio\""
      },
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors"
    });
    console.log(await response.text());

    // const response = await client.get('brunamarquezine');
    const $ = cheerio.load(response.text());

    console.log($('a').html());
    console.log($.html());
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
