const _debug = require('debug');
const {toPairs} = require("lodash");

module.exports = async (client, policy= 0) => {
  const debug = _debug('bot:requests:wwwgraphqlIgQuery');

  const fbHeaders = [
    `IGFxLinkedAccountsQuery`,
    `IGFxLinkedAccountsQuery`,
    `IGPaymentsAccountDisabledRiskQuery`,
    `IGFBPayExperienceEnabled`,
    `IgDonationsEligibilityQuery`,
  ];

  const policies = [
    {
      doc_id: '4324170747611977',
      locale: 'en_US',
      vc_policy: 'default',
      signed_body: `SIGNATURE.`,
      strip_nulls: `true`,
      strip_defaults: `true`,
      query_params: JSON.stringify({}),
    },
    {
      doc_id: '3789388284511218',
      locale: 'en_US',
      vc_policy: 'default',
      signed_body: `SIGNATURE.`,
      strip_nulls: `true`,
      strip_defaults: `true`,
      query_params: JSON.stringify({
        integration_point_id: `449092836056930`,
        session_id: client.getPigeonSessionId(),
      }),
    },
    {
      doc_id: '2897674770271335',
      locale: 'en_US',
      vc_policy: 'default',
      signed_body: `SIGNATURE.`,
      strip_nulls: `true`,
      strip_defaults: `true`,
      query_params: JSON.stringify({}),
    },
    {
      doc_id: '3801135729903457',
      locale: 'en_US',
      vc_policy: 'default',
      signed_body: `SIGNATURE.`,
      strip_nulls: `true`,
      strip_defaults: `true`,
      query_params: JSON.stringify({}),
    },
    {
      doc_id: '2615360401861024',
      locale: 'en_US',
      vc_policy: 'default',
      signed_body: `SIGNATURE.`,
      strip_nulls: `true`,
      strip_defaults: `true`,
      query_params: JSON.stringify({}),
    },
  ];

  const form = policies[policy];

  let headers = {
    'X-FB-Friendly-Name': fbHeaders[policy],
    ...client.headers(),
  };

  delete headers['X-IG-App-Locale'];
  delete headers['X-IG-Device-Locale'];
  delete headers['X-IG-Mapped-Locale'];
  delete headers['X-Pigeon-Session-Id'];
  delete headers['X-Pigeon-Rawclienttime'];
  delete headers['X-IG-Bandwidth-Speed-KBPS'];
  delete headers['X-IG-Bandwidth-TotalBytes-B'];
  delete headers['X-IG-Bandwidth-TotalTime-MS'];
  delete headers['X-Bloks-Version-Id'];
  delete headers['X-IG-WWW-Claim'];
  delete headers['X-Bloks-Is-Layout-RTL'];
  delete headers['X-Bloks-Is-Panorama-Enabled'];
  delete headers['X-IG-Device-ID'];
  delete headers['X-IG-Family-Device-ID'];
  delete headers['X-IG-Android-ID'];
  delete headers['X-IG-Timezone-Offset'];

  let modifiedHeaders = {};
  for (let kv of toPairs(headers)) {
    modifiedHeaders[kv[0]] = kv[1];

    if (kv[0] === 'X-MID') {
      modifiedHeaders['IG-U-IG-DIRECT-REGION-HINT'] = client.getDirectRegionHint();
    }
  }

  const response = await client.send({ url: `/api/v1/wwwgraphql/ig/query/`, method: 'POST', form, headers: modifiedHeaders });
  debug(response);

  return response;
};
