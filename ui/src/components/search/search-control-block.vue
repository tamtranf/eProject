<template>
  <div class="row" :style="style">

          <div class=" col-12" style="padding:0px;margin:0px" v-if="clearingAll === false">
            <div class="row" style="padding:0px;margin:0px;">
              <div class=" col-6" style="padding:0px;margin:0px">
                <select
                  class="form-control select-box limited-height-box"
                  style="width:100%!important;margin-top: 0px;font-size:12px;padding: 0px;padding: 0px 5px;height: 24px;"
                  :disabled="allDisabled"
                  @change="onFilterTypeSelected($event.target.value)"
                  :id="'search_block'+block_id"
                  :name="'search_block'+block_id"
                  :value="selectedFieldName"
                >
                  <option  value=""></option>
                  <option v-for="o in filedList" :data="o" :key="o.id" :value="o.id">{{ o.label }}</option>
                </select>
              </div>
              <div class=" col-6" style="padding:0px 0px 0px 3px;margin:0px;">

                <div v-if="selectedFieldType === false">
                  ...
                </div>

                <div v-else-if="selectedFieldType === filed_types.INPUT || selectedFieldType === filed_types.PASSWORD ||
                selectedFieldType === filed_types.TEXT_AREA">
                  <input
                    :disabled="selected_field === false || allDisabled"
                    ref="local_value"
                    type="text"
                    class="form-control"
                    style="height:24px;font-size:12px; padding-left: 5px;"
                    @input="updateValue($event.target.value)"
                    :id="'search_local_value_'+block_id"  name="local_value"  :model="localValue" :value="localValue" >
                </div>

                <div v-else-if="selectedFieldType === filed_types.SELECT_BOX ">
                  <select-box
                    @on_update="updateValue"
                    :field-info="selected_field" :option="{search_mode:true,search_block_id:this.block_id}" ></select-box>
                </div>
                <div v-else-if="selectedFieldType === filed_types.DATE_PICKER  || selectedFieldType === filed_types.CURRENT_TIME " >
                <date-box
                  :field-info="selected_field"
                  @on_update="updateValue"
                  :option="{search_mode:true,search_block_id:this.block_id}"
                  :read_only="readOnly"></date-box>
                </div>
                <div v-else-if="selectedFieldType === filed_types.RADIO_BUTTON">
                  Not yet supported
                </div>
                <div v-else-if="selectedFieldType === filed_types.CHECKBOX">
                  Not yet supported
                </div>
                <div v-else>
                  <div class="form-group esma_form_group" ><br></div>
                </div>
              </div>
            </div>
          </div>
      </div>
</template>

<script>

import debug from 'debug';
import moment from 'moment';
import _ from 'lodash';

import selectBox from '@/components/fields/select';
import dateBox from '@/components/fields/date-time';
import constants from '../../../../api/rules/constants';

const filed_types = constants.TYPES;

const debug_search_control_block = debug('e:search_control_block');

export default {
  // emits: ['change'],
  components: {
    'date-box': dateBox,
    'select-box': selectBox,
    // 'select-box4': selectBox4,
    // 'input-modal': inputModal,
  },
  data() {
    return {
      local_value: '',
      filed_types: constants.TYPES,
      selected_field: false,
      selected_field_type: constants.TYPES.INPUT,
      field_options: [],
      clearing: false,
      selected_field_name: '',
      sequence_refresh: 1,
      enable_only_id: 'all',

    };
  },
  computed: {
    enableOnlyId: {
      get() {
        return this.enable_only_id;
      },
      set(v) {
        this.enable_only_id = v;
      },
    },
    sequenceRefresh: {
      get() {
        return this.sequence_refresh;
      },
      set(v) {
        this.sequence_refresh = v;
      },
    },
    selectedField: {
      get() {
        return this.selected_field;
      },
      set(v) {
        this.selected_field = v;
      },
    },
    selectedFieldName: {
      get() {
        return this.selected_field_name;
      },
      set(v) {
        this.selected_field_name = v;
      },
    },
    clearingAll: {
      get() {
        return this.clearing;
      },
      set(v) {
        this.clearing = v;
      },
    },
    allDisabled() {
      return this.all_disabled === true;
    },
    localValue: {
      get() {
        return this.local_value;
      },
      set(v) {
        this.local_value = v;
      },
    },
    fieldOptions: {
      get() {
        return this.field_options;
      },
      set(v) {
        this.field_options = v;
      },
    },
    selectedFieldType: {
      get() {
        return this.selected_field_type;
      },
      set(v) {
        this.selected_field_type = v;
      },
    },
    filedList() {
      let local = this.field_names;

      if (this.enableOnlyId && this.enableOnlyId !== 'all') {
        local = _.filter(local, (l) => l.id === this.enableOnlyId);
      }

      const r = (this.sequenceRefresh > 0) ? local.map((o) => ({
        id: o.id, label: o.label, type: o.type, search_dependency: o.search_dependency,
      })) : [];
      return r;
    },
  },
  methods: {
    clearAll() {
      this.clearingAll = true;
      this.localValue = '*';
      this.updateValue('');
      this.localValue = '';
      this.selected_field = false;
      this.selectedFieldType = filed_types.INPUT;
      this.selectedFieldName = '';
      setTimeout(() => {
        this.clearingAll = false;
      }, 200);
    },
    onFilterTypeSelected(val, cb = () => {}) {
      this.selectedFieldName = val;
      this.localValue = '*';
      const f = _.find(this.field_names, { id: val });
      let wait_time = 1;
      if (typeof f !== 'undefined' && f !== null && f !== false && (f.type === filed_types.SELECT_BOX4 || f.type === filed_types.SELECT_BOX2)) {
        this.selected_field = false;
        this.selected_field_type = false;
        wait_time = 100;
      }
      setTimeout(() => {
        debug_search_control_block('before', f, typeof f);
        if (typeof f !== 'undefined' && f !== null && f !== false) {
          this.selected_field = _.clone(f);
          this.selected_field.style = 'font-size:12px;padding: 0px 5px;height: 24px;';
          this.selected_field_type = f.type;
          if (f.type === filed_types.SELECT_BOX) {
            const temp_options = f.options_original || f.options;
            this.fieldOptions = _.clone(temp_options);
          }
        } else {
          this.selected_field = false;
        }
        this.localValue = '';
        debug_search_control_block('onFilterTypeSelected', val, f);
        this.$emit('change', {
          block: this.block_id, field: this.selected_field.id, value: '', ct: 'f', ca: this.clearingAll, t: this.selectedFieldType,
        });
        return cb();
      }, wait_time);
    },
    onManualSelectClose(val) {
      this.value_updated = true;
      if (this.fieldOptions.indexOf(val) < 0) {
        const f = this.selected_field;
        const temp_options = f.options_original || f.options;
        this.fieldOptions = _.clone(temp_options);

        this.fieldOptions.unshift(val);
      }
      this.updateValue(val);
    },
    updateValue(v) {
      if (this.clearingAll === false && this.selectedFieldType === filed_types.SELECT_BOX && v === '') {
        // eslint-disable-next-line no-param-reassign
        v = 'SELECTED_EMPTY_SELECT_BOX';
      }
      this.localValue = v;
      if (typeof v !== 'undefined' && this.selected_field !== false) {
        this.$emit('change', {
          block: this.block_id, field: this.selected_field.id, value: v, ct: 'v', ca: this.clearingAll, t: this.selectedFieldType,
        });
      }
    },
    updateValueDate(v) {
      if (v === null) {
        return v;
      }
      this.updateValue(moment(v).format('YYYY/MM/DD'));
    },
    updateValueDateTime(v) {
      if (v.length < 11) {
        this.updateValue(moment(v).format('YYYY/MM/DD'));
      } else if (moment(v).format('HH:mm') === '00:00') {
        this.updateValue(moment(v).format('YYYY/MM/DD'));
      } else {
        this.updateValue(moment(v).format('YYYY/MM/DD HH:mm'));
      }
    },
    enableOnly(field_id) {
      this.enableOnlyId = field_id;
      this.sequenceRefresh += 1;
    },
  },
  beforeMount() {},
  mounted() {
    if (this.block_controller) {
      this.$props.block_controller.enableOnly = this.enableOnly;
      this.$props.block_controller.getSelectedFieldName = () => this.selectedFieldName;

      this.$props.block_controller.searchClear = () => {
        this.localValue = '';
        this.updateValue('');
        this.clearAll();
      };
    }
  },
  afterMount() {},
  beforeUnmount() {
  },
  props: ['field_names', 'block_id', 'id', 'all_disabled', 'block_controller', 'style'],
};
</script>

<style scoped>

</style>
