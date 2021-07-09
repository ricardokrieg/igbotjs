import InstaRunner from './InstaRunner';
import DizuBrowser, { SeleniumPlatform }  from 'dizu-browser';
import InstaWebBot from 'insta-web-bot';
import * as _debug from 'debug';

const debug = _debug.debug('InstaRunner:app');

(async () => {
    const cookies = `ig_did=60B25B9C-792F-443B-A9DE-0946363905A7; ig_nrcb=1; mid=YGPWpgALAAExMIOsnQFE_NhJYu13; ds_user_id=47107115828; sessionid=47107115828%3AEyf8lBvc9c4AMB%3A4; csrftoken=8BsxV5p3KaZU7z4HoZOpAMt6fkSMsapx; rur=ATN`;
    const username = `test`;

    const webBot = new InstaWebBot(cookies);
    const browser = new DizuBrowser(SeleniumPlatform.Mac);

    const runner = new InstaRunner(username, webBot, browser);
    await runner.run();

    return Promise.resolve();
})();
