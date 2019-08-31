async inbox() {
  await this.setup();

  this.log('Inbox Start');

  const inboxFeed = this.ig.feed.directInbox();

  const threads = await this.call((params) => { return params[0].items(); }, inboxFeed);
  this.log('Threads:');
  this.log(threads);

  this.log('Inbox End');
}

async sendMessage(target, message) {
  await this.setup();

  this.log('SendMessage Start');

  const userId = await this.ig.user.getIdByUsername(target);

  const thread = this.ig.entity.directThread([userId.toString()]);

  await thread.broadcastText(message);

  this.log('SendMessage End');
}