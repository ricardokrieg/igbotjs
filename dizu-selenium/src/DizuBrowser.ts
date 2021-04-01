import { last } from 'lodash';
import {Capabilities, Builder, By, until, WebElement, WebDriver} from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import path from 'path';
import * as _debug from 'debug';
const debug = _debug.debug('DizuBrowser');

enum SeleniumPlatform {
    Mac,
    Windows,
}

interface User {
    username: string
}

export default class DizuBrowser {
    chromeCapabilities: Capabilities;
    driver?: WebDriver;

    constructor(platform: SeleniumPlatform) {
        const absolutePath = path.resolve(DizuBrowser.getPathFromPlatform(platform));
        debug(`ChromeDriver path: ${absolutePath}`);

        const service = new chrome.ServiceBuilder(absolutePath).build();
        chrome.setDefaultService(service);

        const userDataDir = DizuBrowser.getProfileFromPlatform(platform);

        this.chromeCapabilities = Capabilities.chrome();
        this.chromeCapabilities.set('goog:chromeOptions', {
            args: [
                `--user-data-dir=${userDataDir}`,
            ],
            w3c: false,
        });
    }

    async build() {
        this.driver = await new Builder().withCapabilities(this.chromeCapabilities).build();
    }

    async quit() {
        return this.driver.quit();
    }

    async getTask(user: User) {
        await this.driver.get('https://dizu.com.br/painel/conectar');
        let element = await this.driver.wait(until.elementLocated(By.id('instagram_id')), 10000);
        await DizuBrowser.selectByVisibleText(element, user.username);
        element = await this.driver.wait(until.elementLocated(By.id('iniciarTarefas')), 10000);
        await element.click();

        element = await this.driver.wait(until.elementLocated(By.linkText('Ver link')), 10000);
        const href = await element.getAttribute('href');
        return last(href.split('/'));
    }

    async submitTask() {
        return (await this.driver.wait(until.elementLocated(By.id('conectar_form')), 10000)).submit();
    }

    static mac() {
        return new DizuBrowser(SeleniumPlatform.Mac);
    }

    static windows() {
        return new DizuBrowser(SeleniumPlatform.Windows);
    }

    static getProfileFromPlatform(platform: SeleniumPlatform): string {
        switch (platform) {
            case SeleniumPlatform.Mac:
                return '/Users/wolf/Library/Application Support/Google/Chrome/Profile 2';
            case SeleniumPlatform.Windows:
                return 'C:\\Users\\Dorinha Andrade\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1';
            default:
                return '';
        }
    }

    static getPathFromPlatform(platform: SeleniumPlatform): string {
        switch (platform) {
            case SeleniumPlatform.Mac:
                return '../bin/chromedriver';
            case SeleniumPlatform.Windows:
                return '..\\bin\\chromedriver.exe';
            default:
                return '';
        }
    }

    static async selectByVisibleText(element: WebElement, text: string) {
        const options = await element.findElements(By.tagName('option'));

        for (let option of options) {
            const optionText = await option.getText();
            if (optionText === text) {
                return await option.click();
            }
        }
    }
}
