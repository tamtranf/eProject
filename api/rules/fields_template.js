const { TYPES, SELECT_FIELD_MODE } = require('./constants');
//

const arr = [
  { id: 'seq_id', label: 'Unique Key', type: TYPES.SYSTEM },
  {
    id: 'user_name',
    label: 'User Name',
    type: TYPES.INPUT,
    error_if_blank: true,
    export: {
      enabled: true,
      sequence: 1000,
      master_dev: 'C',
    },
  },
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
    id: 'car',
    label: 'Car',
    options_mode: SELECT_FIELD_MODE.API,
    api: {
      url: '/test/get_options',
      label: 'name',
      value: 'id',
      filter: {
        remote_field: 'maker',
        remote_watch: true,
        remote_watch_firs_load_delay: 500,
        remote_filed_filter_field: 'group',
        local_api_filter: 'value',
      },
    },
    type: TYPES.SELECT_BOX,
  },
  {
    id: 'user_password',
    label: 'Password',
    type: TYPES.PASSWORD,
    error_if_blank: true,
  },
  {
    id: 'retrieve_date_time',
    label: 'Retrieve Date Time',
    type: TYPES.DATE_PICKER,
    show_time: true,
    format: 'YYYY/MM/DD HH:mm',
  },
  {
    id: 'return_date',
    label: 'Return Date',
    type: TYPES.DATE_PICKER,
    show_time: false,
    format: 'YYYY/MM/DD',
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
