const { TYPES, SELECT_FIELD_MODE } = require('./constants');
//

const arr = [
  { id: 'seq_id', label: 'Unique Key', type: TYPES.SYSTEM },

  {
    id: 'category',
    label: 'Category',
    type: TYPES.INPUT,
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
    type: TYPES.INPUT,
  },
  {
    id: 'notes',
    label: 'Notes',
    type: TYPES.TEXT_AREA,
  },
  {
    id: 'entity_code',
    label: 'Entity Code',
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
