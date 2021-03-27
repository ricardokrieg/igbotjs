const {Capabilities, Builder, By, until} = require('selenium-webdriver');

class DizuBrowser {
  async constructor(platform) {
    const userDataDir = DizuBrowser.getProfileFromPlatform(platform);
    const chromeCapabilities = Capabilities.chrome();
    chromeCapabilities.set('goog:chromeOptions', {
      args: [
        `--user-data-dir=${userDataDir}`,
      ],
      w3c: false,
    });
    this.driver = await new Builder().withCapabilities(chromeCapabilities).build();
  }

  async getTask(username) {
    await this.driver.get('https://dizu.com.br/painel/conectar');
    let element = await this.driver.wait(until.elementLocated(By.id('instagram_id')), 10000);
    await DizuBrowser.selectByVisibleText(element, username);
    element = await this.driver.wait(until.elementLocated(By.id('iniciarTarefas')), 10000);
    await element.click();

    element = await this.driver.wait(until.elementLocated(By.linkText('Ver link')), 10000);
    const href = await element.getAttribute('href');
    return last(href.split('/'));
  }

  async submitTask() {
    return (await this.driver.wait(until.elementLocated(By.id('conectar_form')), 10000)).submit();
  }

  static async mac() {
    return new DizuBrowser('mac');
  }

  static async windows() {
    return new DizuBrowser('windows');
  }

  static getProfileFromPlatform(platform) {
    if (platform === 'mac') {
      return '/Users/wolf/Library/Application Support/Google/Chrome/Profile 2';
    }

    return 'C:\\Users\\Dorinha Andrade\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1';
  }

  static async selectByVisibleText(element, text) {
    const options = await element.findElements(By.tagName('option'));
    for (let option of options) {
      const optionText = await option.getText();
      if (optionText === text) {
        option.click();
        break;
      }
    }
  }
}

module.exports = DizuBrowser;
