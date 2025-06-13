const { TYPES, SELECT_FIELD_MODE } = require('./constants');
const car = require('./fields_car');
//

const arr = [
  { id: 'seq_id', label: 'Unique Key', type: TYPES.SYSTEM },

  {
    id: 'car_code_id',
    label: 'Car Code ID',
    type: TYPES.INPUT,
  },
  {
    id: 'accessory_code_id',
    label: 'Accessory Code Id',
    type: TYPES.INPUT,
  },

];
car.fields.array.forEach((c) => {
  if (c.id !== 'seq_id') {
    arr.push(c);
  }
});
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
