//const DizuBrowser = require('./DizuBrowser.ts');
import DizuBrowser from './DizuBrowser';

(async () => {
  const dizuBrowser = DizuBrowser.mac();

  await dizuBrowser.build();
  console.log(await dizuBrowser.getTask('getTask'));
})();
