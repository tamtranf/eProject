const { TYPES, SELECT_FIELD_MODE } = require('./constants');
//

const arr = [
  { id: 'seq_id', label: 'Unique Key', type: TYPES.SYSTEM },
  {
    id: 'customer_id',
    label: 'Customer ID',
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
    id: 'customer_name',
    label: 'Customer Name',
    type: TYPES.INPUT,
  },
  {
    id: 'phone_number',
    label: 'Phone Number',
    type: TYPES.INPUT,
    filed_types: 'number',
  },
  {
    id: 'postal_code',
    label: 'Postal Code',
    type: TYPES.INPUT,
  },
  {
    id: 'address',
    label: 'Address',
    type: TYPES.TEXT_AREA,
  },
  {
    id: 'created_date',
    label: 'Created Date',
    type: TYPES.DATE_PICKER,
    show_time: false,
    format: 'YYYY/MM/DD HH:mm',
  },
  {
    id: 'notes',
    label: 'Notes',
    type: TYPES.TEXT_AREA,
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
