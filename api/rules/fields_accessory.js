const { TYPES, SELECT_FIELD_MODE } = require('./constants');
//

const arr = [
  { id: 'seq_id', label: 'Unique Key', type: TYPES.SYSTEM },

  {
    id: 'category',
    label: 'Category',
    options_mode: SELECT_FIELD_MODE.LIST,
    list: [
      { label: 'ETC device', value: 'ETC' },
      { label: 'JAF certificate', value: 'JAF_CERT' },
      { label: 'Child Seat', value: 'CHILD_SEAT' },
      { label: 'Winter Tire', value: 'WINTER_TIRE' },
      { label: 'Snow Chain', value: 'SNOW_CHAIN' },
    ],
    type: TYPES.SELECT_BOX,
  },
  {
    id: 'code_id',
    label: 'CodeId',
    type: TYPES.INPUT,
  },
  {
    id: 'name',
    label: 'Name',
    type: TYPES.INPUT,
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
    id: 'notes',
    label: 'Notes',
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
