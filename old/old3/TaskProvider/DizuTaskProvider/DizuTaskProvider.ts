import {last} from 'lodash';
import {Builder, By, Capabilities, until, WebDriver, WebElement} from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import path from 'path';
import _debug from 'debug';
import {Task, TaskConfirmation, TaskMethod, TaskProvider, TaskRequest, TaskStatus} from '../TaskProvider';
import {NoTask} from '../NoTask';

const debug = _debug('DizuTaskProvider');

enum SeleniumPlatform {
  Mac,
  Windows,
}

export class DizuTaskProvider implements TaskProvider {
  GET_TASK_URL = 'https://dizu.com.br/painel/conectar';

  driver?: WebDriver;
  platform: SeleniumPlatform;

  constructor() {
    this.platform = DizuTaskProvider.detectPlatform();
  }

  async getTask(taskRequest: TaskRequest): Promise<Task> {
    await this.ensureDriver();

    let task;
    do {
      const href = await this.getTaskLink(taskRequest);
      debug(href);

      const splitHref = href.split('/');
      if (splitHref[splitHref.length - 2] === 'p') {
        debug('Skipping "Like" task');
        continue;
      }
      const username = last(splitHref);

      task = { id: '', username, method: TaskMethod.Follow };
    } while (!task);

    return Promise.resolve(task);
  }

  async getTaskLink(taskRequest: TaskRequest): Promise<string> {
    await this.driver.get(this.GET_TASK_URL);
    let element = await this.driver.wait(until.elementLocated(By.id('instagram_id')), 10000);
    await DizuTaskProvider.selectByVisibleText(element, taskRequest.tasker.username);
    element = await this.driver.wait(until.elementLocated(By.id('iniciarTarefas')), 10000);
    await element.click();

    try {
      element = await this.driver.wait(until.elementLocated(By.linkText('Ver link')), 10000);
    } catch (err) {
      if (err.message.includes('Wait timed out after')) {
        element = await this.driver.wait(until.elementLocated(By.className('semTarefas')), 1000);
        if (element.length) {
          throw new NoTask(taskRequest);
        }
      }

      throw err;
    }

    return element.getAttribute('href');
  }

  async confirmTask(taskConfirmation: TaskConfirmation): Promise<void> {
    if (!this.driver) return Promise.resolve();

    if (taskConfirmation.status === TaskStatus.Error) {
      await this.driver.executeScript("$('[name=realizado]').value = '3'");
    }

    return (await this.driver.wait(until.elementLocated(By.id('conectar_form')), 10000)).submit();
  }

  async quit(): Promise<void> {
    if (!this.driver) return Promise.resolve();

    return this.driver.quit();
  }

  private async ensureDriver() {
    if (!this.driver) {
      const capabilities = this.getCapabilities();
      this.driver = await new Builder().withCapabilities(capabilities).build();
    }

    return Promise.resolve();
  }

  private getCapabilities(): Capabilities {
    const absolutePath = path.resolve(this.getPath());
    const userDataDir = this.getProfile();

    debug(`ChromeDriver path: ${absolutePath}`);
    debug(`User Data Dir    : ${userDataDir}`);

    const service = new chrome.ServiceBuilder(absolutePath).build();
    chrome.setDefaultService(service);

    const capabilities = Capabilities.chrome();
    capabilities.set('goog:chromeOptions', {
      args: [
        `--user-data-dir=${userDataDir}`,
      ],
      w3c: false,
    });

    return capabilities;
  }

  private getPath(): string {
    switch (this.platform) {
      case SeleniumPlatform.Mac:
        return './bin/chromedriver';
      case SeleniumPlatform.Windows:
        return '.\\bin\\chromedriver.exe';
      default:
        return '';
    }
  }

  private getProfile(): string {
    switch (this.platform) {
      case SeleniumPlatform.Mac:
        return '/Users/wolf/Library/Application Support/Google/Chrome/Profile 2';
      case SeleniumPlatform.Windows:
        return 'C:\\Users\\Dorinha Andrade\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1';
      default:
        return '';
    }
  }

  private static detectPlatform(): SeleniumPlatform {
    if (process.platform === 'win32') return SeleniumPlatform.Windows;

    return SeleniumPlatform.Mac;
  }

  static async selectByVisibleText(element: WebElement, text: string) {
    const options = await element.findElements(By.tagName('option'));

    for (const option of options) {
      const optionText = await option.getText();
      if (optionText === text) {
        return await option.click();
      }
    }
  }
}
