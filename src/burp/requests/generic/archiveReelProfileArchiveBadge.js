const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:archiveReelProfileArchiveBadge');

  const form = {
    timezone_offset: client.getTimezoneOffset(),
    _uuid: client.getDeviceId(),
  };

  const response = await client.send({ url: `/api/v1/archive/reel/profile_archive_badge/`, method: 'POST', form });
  debug(response);

  return response;
};
