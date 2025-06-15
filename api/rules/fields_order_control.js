const { TYPES, SELECT_FIELD_MODE } = require('./constants');
//

const arr = [
  { id: 'seq_id', label: 'Unique Key', type: TYPES.SYSTEM },
  {

    id: 'order_id',
    label: 'OrderId',
    type: TYPES.INPUT,
  },
  {
    id: 'customer_id',
    label: 'customer_id',
    type: TYPES.INPUT,
  },
  {
    id: 'car_code_id',
    label: 'Car Code ID',
    type: TYPES.INPUT,
  },

  {
    id: 'start_date',
    label: 'Start Date',
    type: TYPES.DATE_PICKER,
    show_time: false,
    format: 'YYYY/MM/DD HH:mm',
  },
  {

    id: 'end_date',
    label: 'End Date',
    type: TYPES.DATE_PICKER,
    show_time: false,
    format: 'YYYY/MM/DD HH:mm',
  },
  {
    id: 'status',
    label: 'status',
    type: TYPES.INPUT,
  },
  {
    id: 'total_value',
    label: 'Total Value',
    type: TYPES.INPUT,
  },
  {
    id: 'notes',
    label: 'Note',
    type: TYPES.TEXT_AREA,
  },
  {
    id: 'entity_code',
    label: 'Entity Code',
    options_mode: SELECT_FIELD_MODE.API,
    api: {
      url: '/master_entity/get_entity_list',
      label: 'entity_name',
      value: 'entity_code',
    },
    type: TYPES.SELECT_BOX,
  },
  {
    id: 'incharge_user_name',
    label: 'Incharge User Name',
    type: TYPES.INPUT,
  },
  { id: 'maker', label: 'Maker', type: TYPES.INPUT },
  { id: 'model', label: 'Model', type: TYPES.INPUT },
  { id: 'license_plate', label: 'Plate', type: TYPES.INPUT },
  { id: 'car_year', label: 'Car year', type: TYPES.INPUT },
  { id: 'color', label: 'Color', type: TYPES.INPUT },
  { id: 'passenger', label: 'Passenger', type: TYPES.INPUT },
  { id: 'category', label: 'Category', type: TYPES.INPUT },
  { id: 'weight', label: 'Weight', type: TYPES.INPUT },
  { id: 'car_price', label: 'Car Price', type: TYPES.INPUT },
  { id: 'car_status', label: 'Car Status', type: TYPES.INPUT },
  { id: 'car_notes', label: 'Car Notes', type: TYPES.INPUT },
  { id: 'maker_name', label: 'Maker', type: TYPES.INPUT },
  { id: 'year_name', label: 'Car Year', type: TYPES.INPUT },
  { id: 'color_name', label: 'Color', type: TYPES.INPUT },
  { id: 'category_name', label: 'Category', type: TYPES.INPUT },
  { id: 'customer_name', label: 'Customer', type: TYPES.INPUT },
  { id: 'phone_number', label: 'Phone', type: TYPES.INPUT },
  { id: 'postal_code', label: 'Postal Code', type: TYPES.INPUT },
  { id: 'address', label: 'Address', type: TYPES.INPUT },
  { id: 'created_date', label: 'Customer Created Date', type: TYPES.INPUT },
  { id: 'customer_notes', label: 'Customer Notes', type: TYPES.INPUT },
  { id: 'full_name', label: 'In charge', type: TYPES.INPUT },

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
