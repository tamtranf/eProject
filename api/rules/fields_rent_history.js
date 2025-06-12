const { TYPES, SELECT_FIELD_MODE } = require('./constants');
//

const arr = [
  { id: 'seq_id', label: 'Unique Key', type: TYPES.SYSTEM },
  {

    id: 'car_id',
    label: 'Car ID',
    type: TYPES.SYSTEM,
  },
  {
    id: 'entity_code',
    label: 'Entity Code',
    type: TYPES.SYSTEM,
  },
  {
    id: 'customer_name',
    label: 'Customer Name',
    type: TYPES.INPUT,
  },

  {
    id: 'from_date',
    label: 'From Date',
    type: TYPES.DATE_PICKER,
    show_time: false,
    format: 'YYYY/MM/DD HH:mm',
  },
  {

    id: 'to_date',
    label: 'To Date',
    type: TYPES.DATE_PICKER,
    show_time: false,
    format: 'YYYY/MM/DD HH:mm',
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
    type: TYPES.TEXT_AREA,
  },
  {
    id: 'customer_id',
    label: 'Customer',
    type: TYPES.SELECT_BOX,
    options_mode: SELECT_FIELD_MODE.API,
    api: {
      url: '/customer/get_customer_list',
      label: 'customer_name',
      value: 'customer_id',
    },
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
