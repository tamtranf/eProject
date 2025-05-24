const { TYPES, SELECT_FIELD_MODE } = require('./constants');
//

const arr = [
  { id: 'seq_id', label: 'Unique Key', type: TYPES.SYSTEM },
  {
    id: 'user_name',
    label: 'User Name',
    options_mode: SELECT_FIELD_MODE.API,
    api: {
      url: '/master_user/get_user_list',
      label: 'user_name',
      value: 'user_name',
    },
    type: TYPES.SELECT_BOX,
  },
  {
    id: 'entity_code',
    label: 'Entity Code',
    options_mode: SELECT_FIELD_MODE.API,
    api: {
      url: '/master_entity/get_entity_list',
      label: 'entity_code',
      value: 'entity_code',
    },
    type: TYPES.SELECT_BOX,
  },

];
const ret = {};
let s = 1;
arr.forEach((e) => {
  /* eslint-disable no-alert, no-console */
  const ex_pattern = '^[a-z][a-z0-9_]+$';
  if (!RegExp(ex_pattern).test(e.id)) { alert(`Invalid field ${e.id}`); }
  e.tab_label = e.tab_label || e.label;
  e.seq_id = s;
  s += 1;
  ret[e.id] = e;
  /* eslint-enable no-alert, no-console */
});
ret.array = arr;
module.exports.fields = ret;
module.exports.filed_types = TYPES;
