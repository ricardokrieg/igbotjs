import { Capabilities, WebElement, WebDriver } from 'selenium-webdriver';
declare enum SeleniumPlatform {
    Mac = 0,
    Windows = 1
}
interface User {
    username: string;
}
export default class DizuBrowser {
    chromeCapabilities: Capabilities;
    driver?: WebDriver;
    constructor(platform: SeleniumPlatform);
    build(): Promise<void>;
    quit(): Promise<void>;
    getTask(user: User): Promise<string>;
    submitTask(): Promise<void>;
    static mac(): DizuBrowser;
    static windows(): DizuBrowser;
    static getProfileFromPlatform(platform: SeleniumPlatform): string;
    static getPathFromPlatform(platform: SeleniumPlatform): string;
    static selectByVisibleText(element: WebElement, text: string): Promise<void>;
}
export {};
