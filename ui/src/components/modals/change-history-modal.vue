<template>
  <button type="button" @click="showModal()" style="float:right;margin-right:10px;" class="btn btn-info">History</button>
<div
  class="modal fade"
  ref="modalChangeHistory"
  id="staticBackdrop"
  data-bs-backdrop="static"
  data-bs-keyboard="false"
  tabindex="-1"
  aria-labelledby="staticBackdropLabel"
  aria-hidden="true"
>
   <div class="modal-dialog modal-xl" style="height: 95%;">
    <div class="modal-content" style="height: 95%;">

      <div class="modal-header">
        <h5 class="modal-title" id="staticBackdropLabel">History</h5>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
          @click="onClose('no')"
        ></button>
      </div>

      <div class="modal-body" style="height: 95%; padding: 0px 15px; overflow-x: auto;">
  <ag-grid-vue
    style="width: 100%; height: 125px;"
    class="ag-theme-blue"
    :gridOptions="gridOptions">
  </ag-grid-vue>

  <div class="row">
    <!-- Bảng dữ liệu A -->
    <div class="col-6">
      <table class="hist_td" style="margin: auto; margin-top: 30px; width: 100%;">
        <tr>
          <th class="hist_td">項目</th>
          <th class="hist_td">古いデータ</th>
          <th class="hist_td">新しいデータ</th>
        </tr>
        <tr v-for="d in dataChangesA" :key="d.id">
          <th class="hist_td">{{ d.label }}</th>
          <td class="hist_td">{{ d.o }}</td>
          <td v-if="d.n.length > 0" class="hist_td" style="color: red;">{{ d.n }}</td>
          <td v-else class="hist_td">{{ d.o }}</td>
        </tr>
      </table>
    </div>

    <!-- Bảng dữ liệu B -->
    <div class="col-6">
      <table
        v-if="Array.isArray(dataChangesB)"
        class="hist_td"
        style="margin: auto; margin-top: 30px; width: 100%;">
        <tr>
          <th class="hist_td">項目</th>
          <th class="hist_td">古いデータ</th>
          <th class="hist_td">新しいデータ</th>
        </tr>
        <tr v-for="d in dataChangesB" :key="d.id">
          <th class="hist_td">{{ d.label }}</th>
          <td class="hist_td">{{ d.o }}</td>
          <td v-if="d.n.length > 0" class="hist_td" style="color: red;">{{ d.n }}</td>
          <td v-else class="hist_td">{{ d.o }}</td>
        </tr>
      </table>
    </div>
  </div>
</div>

      <div class="modal-footer">
        <button type="button" :class="['btn', cancel_class]" @click="onClose('no')"> {{cancel_text}} </button>
        <button type="button" class="btn btn-primary" @click="onClose('yes')"> {{ok_text}} </button>
      </div>

    </div>
  </div>
</div>

</template>
<script>
import mixinFormController from '@/mixins/form_controller';
import mixinLayoutComponents from '@/mixins/layout_components';
import _ from 'lodash';
import acl from '@/mixins/acl';
import { Modal } from 'bootstrap';
import agListController from '@/mixins/ag-list-controller';
import datasource from '@/mixins/datasource';
import { fields } from '../../../../api/rules/fields_change_history';

export default {
  name: '',
  data() {
    return {
      local_fields_ref_a: false,
      local_fields_ref_b: false,
      api_name: 'change_history',
      data_changes: [],
      name: '',
      modalElem: null,

      title: 'Modal',
      text: 'Text',
      ok_text: 'OK',
      cancel_text: 'Cancel',
      ok_class: 'btn-primary',
      cancel_class: 'btn-secondary',
      on_confirm: () => {},

    };
  },

  mixins: [mixinLayoutComponents, mixinFormController, acl, agListController, datasource],
  components: {},
  computed: {
    dataChangesA() {
      const c = parseInt(this.dataChanges.length / 2) + 1;
      return _.chunk(this.dataChanges, c)[0];
    },
    dataChangesB() {
      const c = parseInt(this.dataChanges.length / 2) + 1;
      return _.chunk(this.dataChanges, c)[1];
    },
    dataChanges: {
      get() {
        return this.data_changes;
      },
      set(v) {
        this.data_changes = v;
      },
    },
    fieldList() {
      return fields;
    },
    tabFieldList() {
      return [
        _.extend(fields.change_time, {}),
        _.extend(fields.user_name, {}),
        _.extend(fields.mode, {
          cellRenderer: (params) => {
            if (params.value === 1) {
              return '新規';
            }
            if (params.value === 2) {
              return '更新';
            }
            if (params.value === 3) {
              return '消去';
            }
            return '-';
          },
        }),
      ];
    },

  },
  methods: {
    onClose() { this.modalElem.hide(); },
    showModal() {
      this.modalElem.show();
      this.gridOptions.api.sizeColumnsToFit();
      this.gridOptions.api.purgeInfiniteCache();
      this.countRows('ChangeHistoryModal');
    },
    createColumnDefs() {
      return this.commonCreateColumnDefs({ show_details: false, show_checkbox: false });
    },
    onRowSelected(data_obj) {
      const { data } = data_obj;
      const use_fields = this.$props.tab_fields;
      console.log('onRowSelected', { data, use_fields });
      const old_data = JSON.parse(data.old_data);
      const new_data = JSON.parse(data.new_data);
      const all_keys = Object.keys(old_data);
      Object.keys(new_data).forEach((k) => {
        if (all_keys.indexOf(k) < 0) {
          all_keys.push(k);
        }
      });
      this.dataChanges = [];
      all_keys.forEach((k) => {
        if (k.indexOf('seq_id') < 0 && use_fields && use_fields[k]) {
          const obj = {
            id: k,
            label: (use_fields && use_fields[k]) ? use_fields[k].label : k,
            o: (data.mode === 1) ? '' : `${old_data[k] || ''}`,
            n: (data.mode === 3) ? '' : `${new_data[k] || ''}`,
          };
          if (obj.o.length > 0 || obj.n.length > 0) { this.dataChanges.push(obj); }
        }
      });
    },
  },
  props: ['ref_table', 'ref_id', 'tab_fields'],
  beforeCreate() {
    console.log(`${this.name} beforeCreate`);
  },
  created() {
    console.log(`${this.name} created`);
  },
  beforeMount() {
    console.log(`${this.name} beforeMount`);
    this.gridOptions = _.extend(this.commonGridOptions, {});
    this.api_request_options = { ref_table: this.$props.ref_table, ref_id: this.$props.ref_id };
    this.initDatasource({});
  },
  mounted() {
    this.modalElem = new Modal(this.$refs.modalChangeHistory);
    console.log(`${this.name} mounted`);
    // if (this.seqId === 'new') {
    this.is_new = true;
    // } else {
    //   this.loadFormData();
    // }
  },
  beforeUpdate() {
    console.log(`${this.name} beforeUpdate`);
  },
  updated() {
    console.log(`${this.name} updated`);
  },
  beforeUnmount() {
    console.log(`${this.name} beforeUnmount`);
  },

  unmounted() {
    console.log(`${this.name} unmounted`);
  },
  errorCaptured() {
    console.log(`${this.name} errorCaptured`);
  },
  renderTracked() {},
  renderTriggered() {
    console.log(`${this.name} renderTriggered`);
  },
  activated() {
    console.log(`${this.name} activated`);
  },
  deactivated() {
    console.log(`${this.name} deactivated`);
  },
};
</script>
<style scoped>
.hist_td {
border:1px solid #ccc;
padding:2px 10px;
}
</style>
