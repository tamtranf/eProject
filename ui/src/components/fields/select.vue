<template>

    <select  class="form-control form-select"
    :style="fieldStyle"
    :disabled="isDisabled"
    @change="onLocalSelectedUpdateValue($event.target.value)"
    v-model="field_value"
    :id="fieldID"
    :name="fieldID">
    <option v-for="o in fieldOptions"   :selected="o.value==field_value"
    :data="o.value"
    :key="o.value" :value="o.value">{{o.label}}</option>
    </select>
  {{ refresher }}
</template>
<script>
import common_field from '@/components/fields/mixins/common_field';
import _ from 'lodash';
import { SELECT_FIELD_MODE } from '../../../../api/rules/constants';

export default {
  mixins: [common_field],
  name: 'field-select',
  data() {
    return {
      fields_refresher: 1,
      remote_watch_update_fields: [],
    };
  },
  components: {},
  computed: {
    optionsMode() {
      return this.$props.fieldInfo.options_mode;
    },
    fieldOptions() {
      let ret = [];
      if (this.optionsMode === SELECT_FIELD_MODE.ARRAY) {
        this.$props.fieldInfo.array.forEach((a) => {
          ret.push({ value: a, label: a, show: true });
        });
      } else if (this.optionsMode === SELECT_FIELD_MODE.LIST) {
        this.$props.fieldInfo.list.forEach((f) => {
          f.show = true;
        });
        ret = this.$props.fieldInfo.list;
      } else if (this.optionsMode === SELECT_FIELD_MODE.API) {
        ret = this.$props.fieldInfo.list || [];
      }
      return (this.fields_refresher > 0) ? _.filter(ret, (r) => r.show === true) || [] : [];
    },
  },
  methods: {
    remoteWatchUpdated(field, value, _automattic_loaded = false) {
      const { api } = this.$props.fieldInfo;
      if (api.filter.remote_field === field) {
        const temp_local_value = this.getValue();
        this.$props.fieldInfo.list.forEach((d) => {
          d.show = false;
          if (d.data[api.filter.remote_filed_filter_field] === value) {
            d.show = true;
          } else if (d.data[api.value] === temp_local_value) {
            this.setValue('');
          }
        });
        this.fields_refresher += 1;
      }
    },
    registerRemoteWatchUpdate(field) {
      if (typeof field.ref_field.remoteWatchUpdated == 'function') {
        this.remote_watch_update_fields.push(field);
      }
    },
    onLocalSelectedUpdateValue(v) {
      this.onLocalUpdateValue(v);
      this.remote_watch_update_fields.forEach((f) => {
        if (typeof f.ref_field.remoteWatchUpdated == 'function') {
          f.ref_field.remoteWatchUpdated(this.fieldID, v);
        }
      });
    },
    filterLocalOptionsBasedOnRemoteWatchedValues() {
      const { api } = this.$props.fieldInfo;
      if (api.filter && api.filter.remote_watch) {
        const temp_field = api.filter.remote_field;
        const temp_val = this.getGlobalValue(temp_field);
        this.remoteWatchUpdated(temp_field, temp_val, true);
      }
    },
  },
  props: [],
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.optionsMode === SELECT_FIELD_MODE.API) {
      this.$props.fieldInfo.list = [];
      const { api } = this.$props.fieldInfo;
      this.$ajax.post(api.url, {}, (err, data) => {
        const temp_list = [];
        if (data && Array.isArray(data.list) && data.list.length > 0) {
          data.list.forEach((d) => {
            if (api.filter && api.filter.remote_field) {
              temp_list.push({
                value: d[api.value], label: d[api.label], data: d, show: true,
              });
            } else {
              temp_list.push({
                value: d[api.value], label: d[api.label], data: d, show: true,
              });
            }
          });
        }
        if (temp_list.length > 0) {
          this.$props.fieldInfo.list = temp_list;
          this.fields_refresher += 1;
          this.filterLocalOptionsBasedOnRemoteWatchedValues();
        }
      });
    } else if (this.optionsMode === SELECT_FIELD_MODE.FORM_CONTROL) {
      this.$props.fieldInfo.list = this.$props.fieldInfo.list || [];
    }
  },
  beforeUpdate() {},
  updated() {},
  beforeUnmount() {},
  unmounted() {},
  errorCaptured() {},
  renderTracked() {},
  renderTriggered() {},
  activated() {},
  deactivated() {},
};
</script>
<style scoped></style>
