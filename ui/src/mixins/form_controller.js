import _ from 'lodash';
import moment from 'moment';
import { TYPES, IDS } from '../../../api/rules/constants';

export default {
  data() {
    return {
      local_seq_id: false,
      retrieved_value: false,
      is_new: false,
    };
  },
  computed: {
    // it don't works well at render time
  },
  methods: {
    commonLoadRecord(options, cb = () => {}) {
      if (this.seqId === 'new' || options.force_seq_id === 'new') {
        this.local_seq_id = Number.MAX_SAFE_INTEGER;
        setTimeout(() => {
          this.read_only = false;
          this.is_new = true;
        }, 300);
        return cb(null, {});
      }
      this.is_new = false;
      this.local_seq_id = options.force_seq_id || this.seqId;
      this.$ajax.post(`/${this.api_name}/get/${this.local_seq_id}`, {}, (err, result) => {
        this.retrieved_value = (result && result.data) || {};
        this.is_new = false;
        cb(err, result);
      });
    },
    commonSaveRecord(changes, options, cb = () => {}) {
      this.local_seq_id = options.force_seq_id || this.seqId;
      if (this.is_new) {
        this.local_seq_id = IDS.ADD_NEW_RECORD_ID;
      }

      this.$ajax.post(`/${this.api_name}/set/${this.local_seq_id}`, { changes }, (err, result) => {
        cb(err, result);
      });
    },

    setFormDefaultFields(arr, fields) {
      const ret = [];
      arr.forEach((f) => {
        ret.push(_.clone(fields[f]));
      });
      return ret;
    },
    setFormFields(data) {
      const local_fields_ref = _.union(this.local_fields_ref || [], this.formFieldsSideA || [], this.formFieldsSideB || []);
      local_fields_ref.forEach((field) => {
        if (typeof data[field.id] != 'undefined') {
          field.ref_field.setValue(data[field.id]);
        }
      });
    },
    getFormFieldsValues(only_changed = false) {
      const local_fields_ref = _.union(this.local_fields_ref || [], this.formFieldsSideA || [], this.formFieldsSideB || []);
      const data = {};
      local_fields_ref.forEach((field) => {
        let changed = false;
        changed = this.retrieved_value && this.retrieved_value[field.id] !== field.ref_field.getValue();
        if (this.retrieved_value && this.retrieved_value[field.id]) {
          if (this.retrieved_value && field.type === TYPES.DATE_PICKER) {
            const A = moment(new Date(this.retrieved_value[field.id])).format(field.format);
            const B = moment(new Date(field.ref_field.getValue())).format(field.format);
            changed = A !== B;
          }
        }
        if (only_changed === false || (field.ref_field.valueChanged === true && changed)) {
          data[field.id] = field.ref_field.getValue();
        }
      });
      return data;
    },
    getGlobalValue(field) {
      const local_fields_ref = _.union(this.local_fields_ref || [], this.formFieldsSideA || [], this.formFieldsSideB || []);
      const base_field = _.find(local_fields_ref, (rf) => rf.id === field);
      return base_field.ref_field.getValue();
    },
    setupFieldRelations() {
      const local_fields_ref = _.union(this.local_fields_ref || [], this.formFieldsSideA || [], this.formFieldsSideB || []);
      let not_yet_loaded = false;
      local_fields_ref.forEach((field) => {
        if (typeof field.ref_field === 'undefined') {
          console.log('Failed to load setupFieldRelations at field ', { id: field.id });
          not_yet_loaded = true;
        }
      });
      if (not_yet_loaded) {
        return false;
      }
      local_fields_ref.forEach((field) => {
        field.ref_field.getGlobalValue = this.getGlobalValue;
        const has_remote_watch = _.get(field, 'api.filter.remote_watch', false);
        const remote_watch_firs_load_delay = _.get(field, 'api.filter.remote_watch_firs_load_delay', -1);
        if (has_remote_watch) {
          const remote_field = _.get(field, 'api.filter.remote_field', false);
          if (remote_field) {
            const base_field = _.find(local_fields_ref, (rf) => rf.id === remote_field);
            if (base_field.ref_field) {
              base_field.ref_field.registerRemoteWatchUpdate(field);
              if (remote_watch_firs_load_delay > -1) {
                setTimeout(() => {
                  const source_val = base_field.ref_field.getValue();
                  const source_id = base_field.id;
                  field.ref_field.remoteWatchUpdated(source_id, source_val, true);
                }, remote_watch_firs_load_delay);
              }
            }
          }
        }
      });
      return true;
    },
  },
  mounted() {
    if (this.setupFieldRelations() === false) {
      setTimeout(() => {
        if (this.setupFieldRelations() === false) {
          console.log('Failed to load setupFieldRelations');
        }
      }, 100);
    }
  },
};
