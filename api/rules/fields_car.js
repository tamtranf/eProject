const { TYPES, SELECT_FIELD_MODE } = require('./constants');
//

const arr = [
  { id: 'seq_id', label: 'Unique Key', type: TYPES.SYSTEM },
  {
    id: 'maker',
    label: 'Maker',
    options_mode: SELECT_FIELD_MODE.LIST,
    list: [
      { label: 'Toyota', value: 'Toyota' },
      { label: 'Honda', value: 'Honda' },
      { label: 'Nissan', value: 'Nissan' },
      { label: 'Mazda', value: 'Mazda' },
      { label: 'Mitsubishi', value: 'Mitsubishi' },

    ],
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
    type: TYPES.SELECT_BOX,
    options_mode: SELECT_FIELD_MODE.ARRAY,
    array: [2000, 2001, 2002, 2003, 200, 2010, 2015, 2020, 2018],
  },
  {
    id: 'color',
    label: 'Color',
    options_mode: SELECT_FIELD_MODE.LIST,
    list: [
      { label: 'Black', value: 'Black' },
      { label: 'White', value: 'White' },
      { label: 'Grey', value: 'Grey' },
      { label: 'Red', value: 'Red' },
      { label: 'Blue', value: 'Blue' },

    ],
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
    options_mode: SELECT_FIELD_MODE.LIST,
    list: [
      { label: 'Wagon', value: 'Wagon' },
      { label: 'Sport', value: 'Sport' },
      { label: 'Compact', value: 'Compact' },
      { label: 'SUV', value: 'SUV' },
      { label: 'Normal', value: 'Normal' },

    ],
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
