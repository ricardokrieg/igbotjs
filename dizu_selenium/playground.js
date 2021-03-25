const { last } = require('lodash');
const {Capabilities, Builder, By, until} = require('selenium-webdriver');

const selectByVisibleText = async (element, text) => {
  const options = await element.findElements(By.tagName('option'));
  for (let option of options) {
    const optionText = await option.getText();
    if (optionText === text) {
      option.click();
      break;
    }
  }
};

(async () => {
  const userDataDir = process.argv[2];
  const chromeCapabilities = Capabilities.chrome();
  chromeCapabilities.set('goog:chromeOptions', {
    args: [
      `--user-data-dir="${userDataDir}"`,
    ],
    w3c: false,
  });
  const driver = await new Builder().withCapabilities(chromeCapabilities).build();
  let element;

  try {
    await driver.get('https://dizu.com.br/painel/conectar');

    // element = await driver.wait(until.elementLocated(By.id('instagram_id')), 10000);
    // await selectByVisibleText(element, 'michele_font_ana');
    //
    // element = await driver.wait(until.elementLocated(By.id('iniciarTarefas')), 10000);
    // element.click();
    //
    // element = await driver.wait(until.elementLocated(By.linkText('Ver link')), 10000);
    // const href = await element.getAttribute('href');
    // const username = last(href.split('/'));
    //
    // console.log(username);
    // // FOLLOW USING INSTAGRAM API
    //
    // element = await driver.wait(until.elementLocated(By.id('conectar_form')), 10000);
    // element.submit();

    await driver.wait(until.titleIs('webdriver - Google Search'), 60000);
  } finally {
    await driver.quit();
  }
})();
