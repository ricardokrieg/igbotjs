const { logHandler } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const { map } = require('lodash');

class StatsManager {
  constructor({ username, statsCol, targetsCol, uploadsCol }) {
    this.username   = username;
    this.statsCol   = statsCol;
    this.targetsCol = targetsCol;
    this.uploadsCol = uploadsCol;
  }

  async addStats({ type, reference }) {
    await this.statsCol.insertOne({
      account: this.username,
      type,
      reference,
      timestamp: new Date()
    });
  }

  async addTarget({ followerUsername, pk, followed, blacklisted }) {
    await this.targetsCol.insertOne({
      _id: followerUsername,
      pk,
      followed,
      blacklisted,
      account: this.username,
      timestamp: new Date()
    });
  }

  async addUpload({ image }) {
    await this.uploadsCol.insertOne({
      _id: image,
      account: this.username,
      timestamp: new Date()
    });
  }

  async getBlacklist() {
    return map(await this.targetsCol.find().toArray(), 'pk');
  }

  async getPublishBlacklist() {
    return map(await this.uploadsCol.find().toArray(), '_id');
  }
}

module.exports = StatsManager;
