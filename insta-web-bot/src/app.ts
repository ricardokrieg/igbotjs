import DizuBrowser from 'dizu-selenium';

const browser: DizuBrowser = DizuBrowser.mac();

(async () => {
    await browser.build();
    return await browser.quit();
})();
