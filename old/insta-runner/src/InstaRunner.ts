import DizuBrowser from 'dizu-browser';
import InstaWebBot from 'insta-web-bot';
import * as _debug from 'debug';

const debug = _debug.debug('InstaRunner');

export default class InstaRunner {
    username: string;
    webBot: InstaWebBot;
    browser: DizuBrowser;

    constructor(username: string, webBot: InstaWebBot, browser: DizuBrowser) {
        this.username = username;
        this.webBot   = webBot;
        this.browser  = browser;
    }

    async run(): Promise<void> {
        await this.browser.build();

        const task = await this.browser.getTask(this.username);
        debug(task);

        return Promise.resolve();
    }
}
