import DizuBrowser from 'dizu-browser';
import InstaWebBot from 'insta-web-bot';
export default class InstaRunner {
    username: string;
    webBot: InstaWebBot;
    browser: DizuBrowser;
    constructor(username: string, webBot: InstaWebBot, browser: DizuBrowser);
    run(): Promise<void>;
}
