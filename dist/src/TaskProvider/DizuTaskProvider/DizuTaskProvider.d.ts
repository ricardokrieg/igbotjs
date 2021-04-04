import { WebDriver, WebElement } from 'selenium-webdriver';
import { Task, TaskConfirmation, TaskProvider, TaskRequest } from '../TaskProvider';
declare enum SeleniumPlatform {
    Mac = 0,
    Windows = 1
}
export declare class DizuTaskProvider implements TaskProvider {
    GET_TASK_URL: string;
    driver?: WebDriver;
    platform: SeleniumPlatform;
    constructor();
    getTask(taskRequest: TaskRequest): Promise<Task>;
    confirmTask(taskConfirmation: TaskConfirmation): Promise<void>;
    quit(): Promise<void>;
    private ensureDriver;
    private getCapabilities;
    private getPath;
    private getProfile;
    private static detectPlatform;
    static selectByVisibleText(element: WebElement, text: string): Promise<any>;
}
export {};
