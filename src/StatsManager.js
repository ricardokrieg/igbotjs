const { logHandler } = require('./utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const { map } = require('lodash');

class StatsManager {
  constructor({ username, statsCol, targetsCol }) {
    this.username   = username;
    this.statsCol   = statsCol;
    this.targetsCol = targetsCol;
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

  async getBlacklist() {
    return map(await this.targetsCol.find().toArray(), 'pk');
  }
}

module.exports = StatsManager;
