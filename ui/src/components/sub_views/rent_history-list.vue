<template>
  <div :class="[name,'page']">
    <h1>{{ name }} </h1>
    <div class="col-12" style="">
      <ag-grid-vue style="width: 100%; height: 325px;" class="ag-theme-blue" :gridOptions="gridOptions" > </ag-grid-vue>
      <button class="btn btn-secondary" style="float:right;" @click="$refs.rentHistoryModalNew.showModal()" v-if="showNew===true" >New rent</button>
       <button class="btn btn-warning" style="float:right;"
       @click="$refs.rentHistoryTerminateModalNew.showModal()"
        v-if="showNew===false" >Terminate rent </button>
      <rent_history_modal_new ref="rentHistoryModalNew" :car_id="carID" @updated="onModalUpdated"></rent_history_modal_new>
      <rent_history_terminate_modal_new  ref="rentHistoryTerminateModalNew" :car_id="carID" @updated="onModalUpdated"></rent_history_terminate_modal_new>
    </div>
  </div>
</template>
<script>
import mixinLayoutComponents from '@/mixins/layout_components';
import agListController from '@/mixins/ag-list-controller';
import _ from 'lodash';
import datasource from '@/mixins/datasource';
import acl from '@/mixins/acl';
import rent_history_modal_new from '@/components/modals/rent_history-new-modal';
import rent_history_terminate_modal_new from '@/components/modals/rent_history-terminate-modal';
import { fields } from '../../../../api/rules/fields_rent_history';

export default {
  name: 'rent_history-list',
  data() {
    return {
      name: 'RentHistoryList',
      api_name: 'rent_history',
      detail_page: 'rent_history-form',
      delete_disabled: true,
      car_local_status: false,
    };
  },
  routes: [
    {
      path: '/rent_history-list',
      name: 'rent_history-list',
      meta: { requiresAuth: true },
    },
  ],
  mixins: [mixinLayoutComponents, agListController, datasource, acl],
  computed: {
    showNew() {
      if (this.car_local_status === false) {
        return this.car_status === 'Idle';
      }
      return this.car_local_status === 'Idle';
    },
    carID() {
      return this.car_id;
    },
    fieldList() {
      return fields;
    },
    tabFieldList() {
      const r = [
        _.extend(fields.car_id, {}),
        _.extend(fields.entity_code, {}),
        _.extend(fields.customer_name, {}),
        _.extend(fields.from_date, {}),
        _.extend(fields.to_date, {}),
        _.extend(fields.total_rent_hours, {}),
        _.extend(fields.rent_value, {}),
        _.extend(fields.notes, {}),
      ];
      return r;
    },
    deleteDisabled: {
      get() {
        return this.delete_disabled || this.checkACL(this.userAclAction.DELETE, this.aclRules.DATA_PAGES) === false;
      },
      set(v) {
        this.delete_disabled = v;
      },
    },

  },
  components: { rent_history_modal_new, rent_history_terminate_modal_new },
  methods: {
    onModalUpdated(data) {
      this.gridOptions.api.purgeInfiniteCache();
      this.car_local_status = data.status;
      this.$emit('status_updated', data);
    },
    createColumnDefs() {
      return this.commonCreateColumnDefs({ show_details: false, show_checkbox: false });
    },

  },
  props: ['car_id', 'car_status'],
  beforeCreate() {
  },
  created() {
  },
  beforeMount() {
    this.gridOptions = _.extend(this.commonGridOptions, {});
    this.api_request_options = { car_id: this.carID };
    this.initDatasource({});
  },
  mounted() {
    this.gridOptions.api.sizeColumnsToFit();
  },
  beforeUpdate() {
  },
  updated() {
  },
  beforeUnmount() {
  },
  unmounted() {
  },
  errorCaptured() {
  },
  renderTracked() {

  },
  renderTriggered() {
  },
  activated() {
  },
  deactivated() {
  },
};
</script>
<style scoped></style>
