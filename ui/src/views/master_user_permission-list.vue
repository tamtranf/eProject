<template>
  <app-header></app-header>
  <div :class="[name,'page']">
    <h1>{{ name }} </h1>
    <div class="col-12" style="">
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
      <button style="float:right;" class="btn btn-primary" @click="onAddNew">New</button>
      <button style="float:right;margin-right:10px" class="btn btn-danger"
      :disabled="deleteDisabled" @click="onDeleteSelected">Delete</button>
    </div>
  </div>
</template>
<script>
import mixinLayoutComponents from '@/mixins/layout_components';
import agListController from '@/mixins/ag-list-controller';
import _ from 'lodash';
import datasource from '@/mixins/datasource';
import { fields } from '../../../api/rules/fields_master_use_permission';

export default {
  name: 'master_user_permission-list',
  data() {
    return {
      name: 'MasterUserPermissionList',
      api_name: 'master_user_permission',
      detail_page: 'master_user_permission-form',
      delete_disabled: true,
    };
  },
  routes: [
    {
      path: '/master_user_permission-list',
      name: 'master_user_permission-list',
      meta: { requiresAuth: true },
    },
  ],
  mixins: [mixinLayoutComponents, agListController, datasource],
  computed: {
    fieldList() {
      return fields;
    },
    tabFieldList() {
      const r = [
        _.extend(fields.full_name, {}),
        _.extend(fields.entity_name, {}),
        _.extend(fields.acl_role, {}),

      ];
      return r;
    },
    deleteDisabled: {
      get() {
        return this.delete_disabled;
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
      return this.commonCreateColumnDefs({ show_details: true, show_checkbox: true });
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
  props: [],
  beforeCreate() {
  },
  created() {
  },
  beforeMount() {
    this.gridOptions = _.extend(this.commonGridOptions, {});
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
