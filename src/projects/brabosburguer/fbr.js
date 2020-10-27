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

    if (['promosdirceu1', 'promosdirceu2', 'promosdirceu4', 'teresinapromon', 'teresinapromonews6', 'teresinacupom623', 'teresinacupom5396', 'teresinacupom5339', 'teresinacupom7521'].includes(sender)) {
      continue;
    }

    if(!['teresinacupom7539', 'teresinacupom4305', 'teresinacupom4816', 'teresinacupom2120', 'teresinacupom9193', 'teresinacupom987', 'teresinacupom925', 'teresinacupom6677', 'teresinacupom1752'].includes(sender)) {
      continue;
    }

    if (isUndefined(directs[sender])) {
      directs[sender] = [];
    }

    directs[sender].push(doc.get('target'));
  }

  const followerRes = await dbManager.followersCol().where('project', '==', PROJECT).get();
  const followers = map(followerRes.docs, (doc) => doc.ref.id);

  let global = 0;
  let globalFollowBack = 0;
  forOwn(directs, (targets, sender) => {
    let total = 0;
    let followBack = 0;

    for (let target of targets) {
      if (target === 'ricardokrieg') continue;

      total++;
      global++;

      if (followers.includes(target)) {
        log(`${sender} => ${target}`);
        followBack++;
        globalFollowBack++;
      }
    }

    log(`[${sender}] Total: ${total}, FollowBack: ${followBack}, FBR: ${Math.round((followBack / total) * 100)}%`);
  });

  log(`Total: ${global}, FollowBack: ${globalFollowBack}, FBR: ${Math.round((globalFollowBack / global) * 100)}%`);

  process.exit(0);
})();
