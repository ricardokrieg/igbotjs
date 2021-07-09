const _debug = require('debug');

const scoresBootstrapUsers = async (client) => {
  const debug = _debug('bot:scoresBootstrapUsers');

  const qs = {
    surfaces: JSON.stringify(["autocomplete_user_list","coefficient_besties_list_ranking","coefficient_rank_recipient_user_suggestion","coefficient_ios_section_test_bootstrap_ranking","coefficient_direct_recipients_ranking_variant_2"]),
  };

  const response = await client.send({ url: `/api/v1/scores/bootstrap/users/`, qs });
  debug(response);

  return response;
};

module.exports = scoresBootstrapUsers;
