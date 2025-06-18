const { TYPES, SELECT_FIELD_MODE } = require('./constants');
//

const arr = [
  { id: 'seq_id', label: 'Unique Key', type: TYPES.SYSTEM },
  {
    id: 'change_time',
    label: 'Change Time',
    type: TYPES.DATE_PICKER,
    show_time: false,
    format: 'YYYY/MM/DD HH:mm',
  },
  {
    id: 'user_name',
    label: 'User Name',
    type: TYPES.INPUT,
    // options_mode: SELECT_FIELD_MODE.API,
    // api: {
    //   url: '/customer/get_customer_list',
    //   label: 'customer_name',
    //   value: 'customer_id',
    // },
    // type: TYPES.SELECT_BOX,
  },
  {
    id: 'ref_table',
    label: 'Ref Table',
    type: TYPES.INPUT,
  },
  {
    id: 'ref_id',
    label: 'Ref ID',
    type: TYPES.INPUT,
  },
  {
    id: 'mode',
    label: 'Mode',
    type: TYPES.INPUT,
    filed_types: 'number',
  },
  {
    id: 'old_data',
    label: 'Old Data',
    type: TYPES.INPUT,
  },
  {
    id: 'new_data',
    label: 'New Data',
    type: TYPES.INPUT,
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
