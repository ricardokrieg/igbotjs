const { isUndefined, forOwn, map } = require('lodash');
const { logHandler, longSleep, inputUsername } = require('../../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const DBManager = require('../../DBManager');

const PROJECT = process.env.PROJECT;

(async () => {
  log('Start');

  const dbManager = new DBManager({ username: null });

  const res = await dbManager.dmsCol().where('project', '==', PROJECT).get();
  let directs = {};
  for (let doc of res.docs) {
    const sender = doc.get('account');

    if (isUndefined(directs[sender])) {
      directs[sender] = [];
    }

    directs[sender].push(doc.get('target'));
  }

  const followerRes = await dbManager.followersCol().where('project', '==', PROJECT).get();
  const followers = map(followerRes.docs, (doc) => doc.ref.id);

  forOwn(directs, (targets, sender) => {
    let total = 0;
    let followBack = 0;

    for (let target of targets) {
      total++;

      if (followers.includes(target)) {
        followBack++;
      }
    }

    log(`[${sender}] Total: ${total}, FollowBack: ${followBack}, FBR: ${Math.round((followBack / total) * 100)}%`);
  });

  process.exit(0);
})();
