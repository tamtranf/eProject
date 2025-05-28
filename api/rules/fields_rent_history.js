const { TYPES, SELECT_FIELD_MODE } = require('./constants');
//

const arr = [
  { id: 'seq_id', label: 'Unique Key', type: TYPES.SYSTEM },
  {
<<<<<<< HEAD
    id: 'car_id',
    label: 'Car ID',
    type: TYPES.INPUT,
  },
  {
    id: 'entity_code',
    label: 'Entity Code',
    type: TYPES.INPUT,
  },
  {
    id: 'customer_name',
    label: 'Customer Name',
    type: TYPES.INPUT,
  },
  {
    id: 'from_date',
    label: 'From Date',
=======
    id: 'user_name',
    label: 'User Name',
    type: TYPES.INPUT,
  },
  {
    id: 'password',
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
>>>>>>> 74a4c8fa2efd1dd290b8365abd8fdf6c891064d8
    type: TYPES.DATE_PICKER,
    show_time: false,
    format: 'YYYY/MM/DD',
  },
  {
<<<<<<< HEAD
    id: 'to_date',
    label: 'To Date',
    type: TYPES.DATE_PICKER,
    show_time: false,
    format: 'YYYY/MM/DD',
  },
  {
    id: 'total_rent_hours',
    label: 'Total Rent Hours',
    type: TYPES.INPUT,
    field_type: 'number',
  },
  {
    id: 'rent_value',
    label: 'Rent Value',
    type: TYPES.INPUT,
    field_type: 'number',
  },
  {
    id: 'notes',
    label: 'Note',
    type: TYPES.INPUT,
    field_type: 'textarea',
=======
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
    label: 'Is super Admin',
    options_mode: SELECT_FIELD_MODE.LIST,
    list: [
      { label: 'Yes', value: '1' },
      { label: 'No', value: '0' },

    ],
    type: TYPES.SELECT_BOX,
>>>>>>> 74a4c8fa2efd1dd290b8365abd8fdf6c891064d8
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
