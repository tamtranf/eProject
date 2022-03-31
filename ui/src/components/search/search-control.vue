<template>
  <div>
    <div class="grid-container" :style="style" >
        <search-control-block :all_disabled="b1_disabled" block_id="1" @change="onChange"
        :block_controller="b1Controller" :field_names="field_names" style="padding: 0px 0px; margin: 0px 0px 0px 0px;"></search-control-block>

      <div class="join1" >
        <select class="form-control select-box" :disabled="j1_disabled"
        style="height: 24px; padding: 0px 0px; margin: 0px 0px 0px 0px; font-size: 12px; width:45px; text-align: center; margin: 0 auto ;"
        @change="andOr($event.target.value, 'j1')" :value="joinValue1" id="and_or_2" name="and_or_2">
          <option>AND</option>
          <option>OR</option>
          <option v-if="j1EnabledBetween" value="BETWEEN">~</option>
        </select>
      </div>
      <div class="block2" >
        <search-control-block :all_disabled="b2_disabled" block_id="2" @change="onChange"
        :block_controller="b2Controller" :field_names="field_names" style="padding: 0px 0px; margin: 0px 0px 0px 0px"></search-control-block>
      </div>
      <div class="join2" >
        <select class="form-control select-box" :disabled="j2_disabled"
        style="height: 24px; padding: 0px 0px; margin: 0px 0px 0px 0px; font-size: 12px; width:45px; text-align: center; margin: 0 auto ;"
        @change="andOr($event.target.value, 'j2')" :value="joinValue2" id="and_or_2" name="and_or_2">
          <option>AND</option>
          <option>OR</option>
          <option v-if="j2EnabledBetween" value="BETWEEN">~</option>
        </select>
      </div>
      <div class="block3" >
        <search-control-block :all_disabled="b3_disabled" block_id="3" @change="onChange"
        :block_controller="b3Controller" :field_names="field_names" style="padding: 0px 0px; margin: 0px 0px 0px 0px"></search-control-block>
      </div>
      <div class="block_btn" >
        <button style="width: 210px; float: left; margin-left: 25px;height:24px;padding-top:0px;font-size:14px;"
        class="btn btn-primary esma_btn_form btn-xs" @click="clearBarcode">検索クリア</button>
      </div>
    </div>
  </div>
</template>

<script>
import debug from 'debug';
import searchControlBlock from '@/components/search/search-control-block';
// import constants from '../../../../api/rules/constants';
const debug_search_control = debug('e:search_control');

export default {
  components: {
    'search-control-block': searchControlBlock,
  },
  data() {
    debug_search_control('Startging search control');
    return {
      bock_info: {
        1: false,
        2: false,
        3: false,
        j1: 'AND',
        j2: 'AND',
        b2_disabled: false,
        b3_disabled: false,
      },
      b1_disabled: false,
      j1_disabled: true,
      b2_disabled: true,
      j2_disabled: true,
      b3_disabled: true,
      j1_enabled_between: false, // search_with_between step3
      j2_enabled_between: false,
      join_value_1: 'AND',
      join_value_2: 'AND',
      b1_controller: {},
      b2_controller: {},
      b3_controller: {},
    };
  },

  computed: {
    b1Controller: {
      get() {
        return this.b1_controller;
      },
      set(v) {
        this.b1_controller = v;
      },
    },
    b2Controller: {
      get() {
        return this.b2_controller;
      },
      set(v) {
        this.b2_controller = v;
      },
    },
    b3Controller: {
      get() {
        return this.b3_controller;
      },
      set(v) {
        this.b3_controller = v;
      },
    },
    joinValue1: {
      get() {
        return this.join_value_1;
      },
      set(v) {
        this.join_value_1 = v;
      },
    },
    joinValue2: {
      get() {
        return this.join_value_2;
      },
      set(v) {
        this.join_value_2 = v;
      },
    },
    j1EnabledBetween: {
      get() {
        return this.j1_enabled_between;
      },
      set(v) {
        this.j1_enabled_between = v;
      },
    },
    j2EnabledBetween: {
      get() {
        return this.j2_enabled_between;
      },
      set(v) {
        this.j2_enabled_between = v;
      },
    },
    filedList() {
      return this.field_names.map((o) => ({ id: o.id, label: o.label, type: o.type }));
    },
    dateFilterOptions: {
      get() {
        return [];
      },
      set(_v) {},
    },
    isSingle() {
      return this.single === true;
    },
  },
  methods: {
    clearBarcode(ev) {
      ev.preventDefault();
      this.$store.state.search_dependency_groups = {};
      this.$store.state.search_data = {};
      this.$emit('onSearchClear', '');
      this.b3Controller.searchClear();
      this.b2Controller.searchClear();
      this.b1Controller.searchClear();

      this.joinValue1 = 'AND';
      this.joinValue2 = 'AND';
    },
    andOr(v, id) {
      this.$store.state.search_data[id] = v;
      if (v === 'BETWEEN') {
        this.j1EnabledBetween = true;
      }
      if (id === 'j1') {
        this.joinValue1 = v;
        if (v === 'BETWEEN') {
          this.j1EnabledBetween = true;
          this.b2Controller.enableOnly(this.b1Controller.getSelectedFieldName());
        } else {
          this.j1EnabledBetween = false;
          this.b2Controller.enableOnly('all');
        }
      }
      if (id === 'j2') {
        this.joinValue2 = v;
        if (v === 'BETWEEN') {
          this.j2EnabledBetween = true;
          this.b3Controller.enableOnly(this.b2Controller.getSelectedFieldName());
        } else {
          this.j2EnabledBetween = true;
          this.b3Controller.enableOnly('all');
        }
      }
      this.bock_info[id] = v;
      this.processAndEmit();
    },
    onChange(d) {
      if (typeof this.$store.state.search_data === 'undefined') {
        this.$store.state.search_data = {};
      }
      this.$store.state.search_data[d.block] = d;
      this.bock_info[d.block] = d;
      this.processAndEmit();
    },
    processAndEmit() {
      this.b2_disabled = false;
      this.b3_disabled = false;
      this.j1_disabled = false;
      this.j2_disabled = false;
      this.j1EnabledBetween = false; // search_with_between step4
      this.j2EnabledBetween = false;

      this.bock_info.is_block_info = true;
      if (this.bock_info['1'] === false || this.bock_info['1'].value === '') {
        this.b2_disabled = true;
        this.b3_disabled = true;
        this.j1_disabled = true;
        this.j2_disabled = true;
      }
      if (this.bock_info['2'] === false || this.bock_info['2'].value === '') {
        this.b3_disabled = true;
        this.j2_disabled = true;
      }
      if (this.bock_info['1'] !== false && this.bock_info['1'].t && (this.bock_info['1'].t.indexOf('datetime_picker') === 0 ||
       this.bock_info['1'].t.indexOf('current_time') === 0 ||
       this.bock_info['1'].t.indexOf('date_picker') === 0)) {
        this.j1EnabledBetween = true;
      } else if (this.bock_info['2'] !== false) {
        if (this.bock_info.j1 === 'BETWEEN') {
          this.andOr('AND', 'j1');
        }
      }

      if (this.bock_info['2'] !== false && this.bock_info['2'].t && (this.bock_info['2'].t.indexOf('datetime_picker') === 0 ||
       this.bock_info['2'].t.indexOf('current_time') === 0 ||
       this.bock_info['2'].t.indexOf('date_picker') === 0)) {
        this.j2EnabledBetween = true;
      } else if (this.bock_info['3'] !== false) {
        // this.andOr("AND",2)
        if (this.bock_info.j2 === 'BETWEEN') {
          this.andOr('AND', 'j2');
        }
      }
      this.bock_info.b2_disabled = this.b2_disabled;
      this.bock_info.b3_disabled = this.b3_disabled;
      debug_search_control('Data changed', JSON.stringify(this.bock_info, null, 4));
      this.$emit('change', this.bock_info);
    },
    onFilterTypeSelected(val, id) {
      debug_search_control({ val, id });
    },
    onDateFilterSelected() {},
  },
  beforeMount() {},
  mounted() {
    this.$store.state.search_dependency_groups = {};
    this.$store.state.search_data = {};
  },
  afterMount() {},
  beforeUnmount() {
  },
  props: ['field_names', 'single', 'style'],
};
</script>

<style scoped>
.grid-container {
  display: -ms-grid;
  display: grid;
  -ms-grid-columns: 40fr 10fr 40fr 10fr 40fr 25fr;
  grid-template-columns: 40fr 10fr 40fr 10fr 40fr 25fr;
  -ms-grid-rows: 1fr;
  grid-template-rows: 1fr;
  grid-template-areas: 'block1  join1  block2  join2  block3 block_btn';
}

.block1 {
  -ms-grid-row: 1;
  grid-row: 1;
  -ms-grid-column: 1;
  grid-column: 1;
  grid-area: block1;
}

.join1 {
  -ms-grid-row: 1;
  grid-row: 1;
  -ms-grid-column: 2;
  grid-column: 2;
  grid-area: join1;
}

.block2 {
  -ms-grid-row: 1;
  grid-row: 1;
  -ms-grid-column: 3;
  grid-column: 3;
  grid-area: block2;
}

.join2 {
  -ms-grid-row: 1;
  grid-row: 1;
  -ms-grid-column: 4;
  grid-column: 4;
  grid-area: join2;
}

.block3 {
  -ms-grid-row: 1;
  grid-row: 1;
  -ms-grid-column: 5;
  grid-column: 5;
  grid-area: block3;
}

.block_btn {
  -ms-grid-row: 1;
  grid-row: 1;
  -ms-grid-column: 6;
  grid-column: 6;
  grid-area: block_btn;
}
</style>
