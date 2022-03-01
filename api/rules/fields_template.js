const { TYPES, SELECT_FIELD_MODE } = require('./constants');
//

const arr = [
  { id: 'seq_id', label: 'Unique Key', type: TYPES.INPUT },

  {
    id: 'test_field_1',
    label: 'Text field 1',
    type: TYPES.INPUT,
    error_if_blank: true,
    export: {
      enabled: true,
      sequence: 1000,
      master_dev: 'B',
    },
  },
  {
    id: 'test_field_2',
    label: 'Text field 2',
    type: TYPES.INPUT,
    error_if_blank: true,
    export: {
      enabled: true,
      sequence: 1000,
      master_dev: 'C',
    },
  },
  {
    id: 'select_field_1',
    label: 'Select Field 1',
    options_mode: SELECT_FIELD_MODE.LIST,
    list: [
      { label: 'O 1', value: 'opt1' },
      { label: 'O 2', value: 'opt2' },
      { label: 'O 3', value: 'opt3' },
      { label: 'O 4', value: 'opt4' },
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
