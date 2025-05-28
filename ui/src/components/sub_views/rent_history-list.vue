<template>
<<<<<<< HEAD

  <div :class="[name,'page']">
    <h1>{{ name }} </h1>
    <div class="col-12" style="">

      <ag-grid-vue style="width: 100%; height: 325px;"
        class="ag-theme-blue"
        :gridOptions="gridOptions"
        >
      </ag-grid-vue>
      <br>
      <!-- <button style="float:right;" class="btn btn-primary" @click="onAddNew"
      :disabled="checkACL(userAclAction.ADD,aclRules.DATA_PAGES) === false"
      >New</button>
      <button style="float:right;margin-right:10px" class="btn btn-danger"
      :disabled="deleteDisabled" @click="onDeleteSelected">Delete</button> -->
=======
  <div :class="[name,'page']">
    <h1>{{ name }} </h1>
    <div class="col-12" style="">
      <ag-grid-vue style="width: 100%; height: 325px;" class="ag-theme-blue" :gridOptions="gridOptions" > </ag-grid-vue>
>>>>>>> e8bf277 (renthistory)
    </div>
  </div>
</template>
<script>
import mixinLayoutComponents from '@/mixins/layout_components';
import agListController from '@/mixins/ag-list-controller';
import _ from 'lodash';
import datasource from '@/mixins/datasource';
import acl from '@/mixins/acl';
import { fields } from '../../../../api/rules/fields_rent_history';

export default {
  name: 'rent_history-list',
  data() {
    return {
      name: 'RentHistoryList',
      api_name: 'rent_history',
      detail_page: 'rent_history-form',
      delete_disabled: true,
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
<<<<<<< HEAD
=======
    carID() {
      return this.car_id;
    },
>>>>>>> e8bf277 (renthistory)
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
<<<<<<< HEAD
=======
        _.extend(fields.total_rent_hours, {}),
>>>>>>> e8bf277 (renthistory)
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
  methods: {
    onAddNew() {
      return this.$router.push({
        name: this.detail_page,
        params: { seq_id: 'new' },
      });
    },
    createColumnDefs() {
      return this.commonCreateColumnDefs({ show_details: false, show_checkbox: false });
    },
    onDetailsClick(_ev, data) {
      console.log('onDetailsClick', { data });
      return this.$router.push({
        name: this.detail_page,
        params: { seq_id: data.seq_id },
      });
    },
    onArraySelected(_ev, data) {
      console.log('onArraySelected', { _ev, data });
      this.deleteDisabled = Array.isArray(this.selectedRowArr) ? this.selectedRowArr.length < 1 : true;
    },
    onDeleteSelected() {
      console.log('onDeleteSelected');
      this.commonDeleteSelected((err) => {
        if (err) {
          this.$notify({
            type: 'error',
            title: 'Error',
            text: err,
          });
        } else {
          this.$notify({
            type: 'success',
            title: 'Deleted',
            text: 'Success',
          });
        }
      });
    },
  },
  props: ['car_id'],
  beforeCreate() {
  },
  created() {
  },
  beforeMount() {
    this.gridOptions = _.extend(this.commonGridOptions, {});
<<<<<<< HEAD
=======
    this.api_request_options = { car_id: this.carID };
>>>>>>> e8bf277 (renthistory)
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
