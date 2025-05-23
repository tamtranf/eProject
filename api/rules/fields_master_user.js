const { TYPES, SELECT_FIELD_MODE } = require('./constants');
//

const arr = [
  { id: 'seq_id', label: 'Unique Key', type: TYPES.SYSTEM },
  {
    id: 'user_name',
    label: 'User Name',
    type: TYPES.INPUT,
  },
  {
    id: 'pass_word',
    label: 'Password',
    type: TYPES.INPUT,
    field_type: 'password',
  },
  {
    id: 'full_name',
    label: 'Full Name',
    type: TYPES.INPUT,
  },
  {
    id: 'last_login',
    label: 'Last Login',
    type: TYPES.DATE_PICKER,
    show_time: false,
    format: 'YYYY/MM/DD',
  },
  {
    id: 'status',
    label: 'Status',
    options_mode: SELECT_FIELD_MODE.LIST,
    list: [
      { label: 'Enable', value: '1' },
      { label: 'Disable', value: '9' },

    ],
    type: TYPES.SELECT_BOX,
  },
  {
    id: 'is_super_admin',
    label: 'Status',
    options_mode: SELECT_FIELD_MODE.LIST,
    list: [
      { label: 'Yes', value: '1' },
      { label: 'No', value: '0' },

    ],
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
