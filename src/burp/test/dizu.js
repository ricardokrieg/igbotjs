const DizuAPI = require('../DizuAPI');

(async () => {
  const accountId = `48782794833`;
  // TODO proxy br
  const dizu = new DizuAPI();

  const data = await dizu.getTask(accountId);
  await dizu.submitTask(data.connectFormId, accountId);
})();
