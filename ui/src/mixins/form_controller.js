import _ from 'lodash';

export default {
  methods: {
    setFormFields(data) {
      this.local_fields_ref.forEach((field) => {
        if (typeof data[field.id] != 'undefined') {
          field.ref_field.setValue(data[field.id]);
        }
      });
    },
    getFormFieldsValues(only_changed = false) {
      const data = {};
      this.local_fields_ref.forEach((field) => {
        if (only_changed === false || field.ref_field.valueChanged === true) {
          data[field.id] = field.ref_field.getValue();
        }
      });
      return data;
    },
    getGlobalValue(field) {
      const base_field = _.find(this.local_fields_ref, (rf) => rf.id === field);
      return base_field.ref_field.getValue();
    },
    setupFieldRelations() {
      let not_yet_loaded = false;
      this.local_fields_ref.forEach((field) => {
        if (typeof field.ref_field == 'undefined') {
          console.log('Failed to load setupFieldRelations at field ', { id: field.id });
          not_yet_loaded = true;
        }
      });
      if (not_yet_loaded) {
        return false;
      }
      this.local_fields_ref.forEach((field) => {
        field.ref_field.getGlobalValue = this.getGlobalValue;
        const has_remote_watch = _.get(field, 'api.filter.remote_watch', false);
        const remote_watch_firs_load_delay = _.get(field, 'api.filter.remote_watch_firs_load_delay', -1);
        if (has_remote_watch) {
          const remote_field = _.get(field, 'api.filter.remote_field', false);
          if (remote_field) {
            const base_field = _.find(this.local_fields_ref, (rf) => rf.id === remote_field);
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
