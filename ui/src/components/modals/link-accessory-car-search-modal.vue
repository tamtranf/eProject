<template>
  <button type="button" @click="showModal()" style="float:right;margin-right:10px;" class="btn btn-info">Select</button>
<div
  class="modal fade"
  ref="modalSearchCar"
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
        <h5 class="modal-title" id="staticBackdropLabel">Car</h5>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
          @click="onClose('no')"
        ></button>
      </div>

      <div class="modal-body" style="height: 95%; padding: 0px 15px; overflow-x: auto;">
   <search-control
        style="padding-bottom: 10px;"
        @change="searchControlChangedDatasource"
        :field_names="tabFieldList"></search-control>
      <ag-grid-vue style="width: 100%; height: 325px;"
        class="ag-theme-blue"
        :gridOptions="gridOptions"
        >
      </ag-grid-vue>
      <br>

</div>

      <div class="modal-footer">
        <button type="button" :class="['btn', cancel_class]" @click="onClose('no')"> {{cancel_text}} </button>
        <button type="button" class="btn btn-primary" @click="onselect()"> Select </button>
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
import { fields } from '../../../../api/rules/fields_car';

export default {
  name: '',
  data() {
    return {
      api_name: 'car',
      name: '',
      modalElem: null,

      title: 'Modal',
      text: 'Text',
      ok_text: 'OK',
      cancel_text: 'Cancel',
      ok_class: 'btn-primary',
      cancel_class: 'btn-secondary',
      on_confirm: () => {},
      selected_data_obj: true,

    };
  },

  mixins: [mixinLayoutComponents, mixinFormController, acl, agListController, datasource],
  components: {},
  computed: {
    tabFieldList() {
      const r = [
        _.extend(fields.maker_name, {}),
        _.extend(fields.model, {}),
        _.extend(fields.year_name, {}),
        _.extend(fields.color_name, {}),
        _.extend(fields.price_per_day, {}),
        _.extend(fields.entity_code, {}),
        _.extend(fields.entity_name, {}),
        _.extend(fields.code_id, {}),
      ];
      return r;
    },

  },
  methods: {
    onselect() {
      if (this.selected_data_obj !== false) {
        this.$emit('selected', this.selected_data_obj.data);
      }
    },
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
    onRowSelected(data_obj) { this.selected_data_obj = data_obj; },

  },
  props: [],
  beforeCreate() {
    console.log(`${this.name} beforeCreate`);
  },
  created() {
    console.log(`${this.name} created`);
  },
  beforeMount() {
    console.log(`${this.name} beforeMount`);
    this.gridOptions = _.extend(this.commonGridOptions, {});
    this.initDatasource({});
  },
  mounted() {
    this.modalElem = new Modal(this.$refs.modalSearchCar);
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
</style>
