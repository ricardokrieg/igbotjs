const querystring = require('querystring');
const _debug = require('debug');

const wwwgraphqlIgQuery = async (client, policy=0) => {
  const debug = _debug('bot:wwwgraphqlIgQuery');

  const policies = [
    {
      doc_id: '4324170747611977',
      locale: 'en_US',
      vc_policy: 'default',
      signed_body: `SIGNATURE.`,
      strip_nulls: true,
      strip_defaults: true,
      query_params: JSON.stringify({}),
    },
    {
      doc_id: '3789388284511218',
      locale: 'en_US',
      vc_policy: 'default',
      signed_body: `SIGNATURE.`,
      strip_nulls: true,
      strip_defaults: true,
      query_params: JSON.stringify({
        integration_point_id: `449092836056930`,
        session_id: client.pigeonSessionId(),
      }),
    }
  ]

  const form = policies[policy];

  const response = await client.send({ url: `/api/v1/wwwgraphql/ig/query/`, method: 'POST', form });
  debug(response);

  return response;
};

module.exports = wwwgraphqlIgQuery;
