const { TYPES, SELECT_FIELD_MODE } = require('./constants');
//

const arr = [
  { id: 'seq_id', label: 'Unique Key', type: TYPES.SYSTEM },
  {
    id: 'maker',
    label: 'Maker',
    options_mode: SELECT_FIELD_MODE.API,
    api: {
      url: '/master_maker/get_maker_list',
      label: 'maker_name',
      value: 'maker_code',
    },
    type: TYPES.SELECT_BOX,
  },
  {
    id: 'model',
    label: 'Model',
    type: TYPES.INPUT,
  },
  {
    id: 'license_plate',
    label: 'License Plate',
    type: TYPES.INPUT,
    filed_type: 'text',
  },
  {
    id: 'car_year',
    label: 'Car Year',
    options_mode: SELECT_FIELD_MODE.API,
    api: {
      url: '/master_year/get_year_list',
      label: 'year_name',
      value: 'year_code',
    },
    type: TYPES.SELECT_BOX,
  },
  {
    id: 'color',
    label: 'Color',
    options_mode: SELECT_FIELD_MODE.API,
    api: {
      url: '/master_color/get_color_list',
      label: 'color_name',
      value: 'color_code',
    },
    type: TYPES.SELECT_BOX,
  },
  {
    id: 'passenger',
    label: 'Passenger',
    type: TYPES.INPUT,
    field_type: 'number',
  },
  {
    id: 'category',
    label: 'category',
    options_mode: SELECT_FIELD_MODE.API,
    api: {
      url: '/master_category/get_category_list',
      label: 'category_name',
      value: 'category_code',
    },
    type: TYPES.SELECT_BOX,
  },
  {
    id: 'weight',
    label: 'weight',
    type: TYPES.INPUT,
    field_type: 'number',
  },
  {
    id: 'price_per_day',
    label: 'Price Per Day',
    type: TYPES.INPUT,
    field_type: 'number',
  },
  {
    id: 'status',
    label: 'status',
    options_mode: SELECT_FIELD_MODE.LIST,
    list: [
      { label: 'Idle', value: 'Idle' },
      { label: 'Rented', value: 'Rented' },
      { label: 'Maintenance', value: 'Maintenance' },
    ],
    type: TYPES.SELECT_BOX,
  },
  {
    id: 'notes',
    label: 'notes',
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
  { id: 'entity_name', label: 'Entity Name', type: TYPES.INPUT },
  { id: 'maker_name', label: 'Maker', type: TYPES.INPUT },
  { id: 'color_name', label: 'Color', type: TYPES.INPUT },
  { id: 'year_name', label: 'Year', type: TYPES.INPUT },
  { id: 'category_name', label: 'Category', type: TYPES.INPUT },
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
