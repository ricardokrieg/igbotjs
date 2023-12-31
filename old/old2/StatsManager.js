const { logHandler } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const { map, filter, isEmpty, isUndefined } = require('lodash');
const moment = require('moment');

class StatsManager {
  constructor({ username, runsCol, actionsCol, statsCol, targetsCol, uploadsCol, blacklistCol, dmsCol, followersCol }) {
    this.username     = username;
    this.runsCol      = runsCol;
    this.actionsCol   = actionsCol;
    this.statsCol     = statsCol;
    this.targetsCol   = targetsCol;
    this.uploadsCol   = uploadsCol;
    this.blacklistCol = blacklistCol;
    this.dmsCol = dmsCol;
    this.followersCol = followersCol;
  }

  async addRun({ actions }) {
    log(`addRun actions:${actions}`);

    await this.runsCol.insertOne({
      account: this.username,
      actions: actions,
      timestamp: new Date()
    });
  }

  async getLastRun() {
    const lastRun = await this.runsCol.find({ account: this.username }).sort({ timestamp: -1 }).limit(1).toArray();

    if (isEmpty(lastRun)) {
      return null;
    }

    return moment(lastRun[0].timestamp);
  }

  async addStats({ type, reference }) {
    await this.statsCol.insertOne({
      account: this.username,
      type,
      reference,
      timestamp: new Date()
    });
  }

  async addAction({ type, reference }) {
    await this.actionsCol.add({
      account: this.username,
      type,
      reference,
      timestamp: new Date()
    });
  }

  async addTarget({ followerUsername, pk, source, sourceType, followed, blacklisted, brabosburguer }) {
    let brabosburguerValue = isUndefined(brabosburguer) ? false : brabosburguer;

    try {
      await this.targetsCol.doc(followerUsername).set({
        pk,
        followed,
        blacklisted,
        brabosburguer: brabosburguerValue,
        scraper: this.username,
        source,
        source_type: sourceType,
        timestamp: new Date()
      });
    } catch (e) {
      log.error(e);
    }
  }

  async getTargets({ project }) {
    const blacklist = await this.getBlacklist({ project });

    const res = await this.targetsCol.where('project', '==', project).get();
    const whitelisted = filter(res.docs, (doc) => !blacklist.includes(doc.ref.id));
    return map(whitelisted, (doc) => ({ username: doc.ref.id, pk: doc.get('pk') }));
  }

  async addToDirect({ message, pk, project, target }) {
    await this.dmsCol.add({
      account: this.username,
      message,
      pk,
      project,
      target,
      timestamp: new Date()
    });
  }

  async addUpload({ image }) {
    await this.uploadsCol.add({
      account: this.username,
      reference: image,
      timestamp: new Date()
    });
  }

  async addToFollowers({ username, params }) {
    try {
      await this.followersCol.doc(username).create({ ...params, timestamp: new Date() });
    } catch (e) {
      log.error(`User already on follower list: ${username}`);
    }
  }

  async addToBlacklist({ username, params }) {
    try {
      await this.blacklistCol.doc(username).create({ ...params, timestamp: new Date() });
    } catch (e) {
      log.error(`User already on blacklist: ${username}`);
    }
  }

  async getBlacklist({ project }) {
    const res = await this.blacklistCol.where('project', '==', project).get();
    return map(res.docs, (doc) => doc.ref.id);
  }

  async getBlacklistV1() {
    const res = await this.targetsCol.select('pk').get();
    return map(res.docs, (doc) => doc.get('pk'));
  }

  async getPublishBlacklist() {
    return map(await this.uploadsCol.find().toArray(), 'reference');
  }

  async getActionsBetween({ min, max }) {
    return await this.actionsCol.find({
      account: this.username,
      timestamp: {
        '$gte': new Date(min.toISOString()),
        '$lte': new Date(max.toISOString()),
      },
    });
  }

  async getPublishedToday() {
    const lastUpload = await this.uploadsCol.find({
      account: this.username
    }).sort({ timestamp: -1 }).limit(1).toArray()[0];

    if (!lastUpload) {
      return false;
    }

    return moment().isSame(lastUpload['timestamp'], 'day');
  }
}

module.exports = StatsManager;
