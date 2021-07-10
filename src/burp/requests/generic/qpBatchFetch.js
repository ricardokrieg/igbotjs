const _debug = require('debug');

const qpBatchFetch = async (client) => {
  const debug = _debug('bot:qpBatchFetch');

  const data = {
    surfaces_to_triggers: "{\"5734\":[\"instagram_explore_prompt\"],\"4715\":[\"instagram_explore_header\"]}",
    surfaces_to_queries: "{\"5734\":\"Query QuickPromotionSurfaceQuery: Viewer{viewer(){eligible_promotions.trigger_context_v2(<trigger_context_v2>).ig_parameters(<ig_parameters>).trigger_name(<trigger_name>).surface_nux_id(<surface>).external_gating_permitted_qps(<external_gating_permitted_qps>).supports_client_filters(true).include_holdouts(true){edges{client_ttl_seconds,log_eligibility_waterfall,is_holdout,priority,time_range{start,end},node{id,promotion_id,logging_data,is_server_force_pass,max_impressions,triggers,contextual_filters{clause_type,filters{filter_type,unknown_action,value{name,required,bool_value,int_value,string_value},extra_datas{name,required,bool_value,int_value,string_value}},clauses{clause_type,filters{filter_type,unknown_action,value{name,required,bool_value,int_value,string_value},extra_datas{name,required,bool_value,int_value,string_value}},clauses{clause_type,filters{filter_type,unknown_action,value{name,required,bool_value,int_value,string_value},extra_datas{name,required,bool_value,int_value,string_value}},clauses{clause_type,filters{filter_type,unknown_action,value{name,required,bool_value,int_value,string_value},extra_datas{name,required,bool_value,int_value,string_value}}}}}},is_uncancelable,template{name,parameters{name,required,bool_value,string_value,color_value}},creatives{title{text},content{text},footer{text},social_context{text},social_context_images,primary_action{title{text},url,limit,dismiss_promotion},secondary_action{title{text},url,limit,dismiss_promotion},dismiss_action{title{text},url,limit,dismiss_promotion},image.scale(<scale>){uri,width,height},dark_mode_image.scale(<scale>){uri,width,height}}}}}}}\",\"4715\":\"Query QuickPromotionSurfaceQuery: Viewer{viewer(){eligible_promotions.trigger_context_v2(<trigger_context_v2>).ig_parameters(<ig_parameters>).trigger_name(<trigger_name>).surface_nux_id(<surface>).external_gating_permitted_qps(<external_gating_permitted_qps>).supports_client_filters(true).include_holdouts(true){edges{client_ttl_seconds,log_eligibility_waterfall,is_holdout,priority,time_range{start,end},node{id,promotion_id,logging_data,is_server_force_pass,max_impressions,triggers,contextual_filters{clause_type,filters{filter_type,unknown_action,value{name,required,bool_value,int_value,string_value},extra_datas{name,required,bool_value,int_value,string_value}},clauses{clause_type,filters{filter_type,unknown_action,value{name,required,bool_value,int_value,string_value},extra_datas{name,required,bool_value,int_value,string_value}},clauses{clause_type,filters{filter_type,unknown_action,value{name,required,bool_value,int_value,string_value},extra_datas{name,required,bool_value,int_value,string_value}},clauses{clause_type,filters{filter_type,unknown_action,value{name,required,bool_value,int_value,string_value},extra_datas{name,required,bool_value,int_value,string_value}}}}}},is_uncancelable,template{name,parameters{name,required,bool_value,string_value,color_value}},creatives{title{text},content{text},footer{text},social_context{text},social_context_images,primary_action{title{text},url,limit,dismiss_promotion},secondary_action{title{text},url,limit,dismiss_promotion},dismiss_action{title{text},url,limit,dismiss_promotion},image.scale(<scale>){uri,width,height},dark_mode_image.scale(<scale>){uri,width,height}}}}}}}\"}",
    vc_policy: `default`,
    _csrftoken: client.csrfToken(),
    _uid: client.attrs.userId,
    _uuid: client.attrs.uuid,
    scale: 1,
    version: 1,
  }

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const response = await client.send({ url: `/api/v1/qp/batch_fetch/`, method: 'POST', form });
  debug(response);

  return response;
};

module.exports = qpBatchFetch;
