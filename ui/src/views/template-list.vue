<template>
  <app-header></app-header>
  <div :class="[name,'page']">
    <h1>This is the {{ name }} page..</h1>

    <div class="col-12" style="">
      <ag-grid-vue style="width: 100%; height: 325px;"
          class="ag-theme-blue"
           :gridOptions="gridOptions"
          :rowData="rowData">
      </ag-grid-vue>
    </div>
  </div>
</template>
<script>
import mixinLayoutComponents from '@/mixins/layout_components';
import agListController from '@/mixins/ag-list-controller';
import _ from 'lodash';
import datasource from '@/mixins/datasource';
import { fields } from '../../../api/rules/fields_template';

export default {
  name: 'template-list',
  data() {
    return {
      name: 'TemplateList',
      api_name: 'template',
      // columnDefs: [
      //   { headerName: 'Make', field: 'make' },
      //   { headerName: 'Model', field: 'model' },
      //   { headerName: 'Price', field: 'price' },
      // ],
      rowData: [
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 },
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 },
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 },
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 },
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 },
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 },
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 },

      ],
    };
  },
  routes: [
    {
      path: '/template-list',
      name: 'template-list',
    },
  ],
  mixins: [mixinLayoutComponents, agListController, datasource],
  components: { },
  computed: {
    fieldList() {
      return fields;
    },
    tabFieldList() {
      const r = [
        _.extend(fields.test_field_1, {}),
        _.extend(fields.test_field_2, {}),
        _.extend(fields.select_field_1, {}),
      ];
      return r;
    },

  },
  methods: {
    createColumnDefs() {
      return this.commonCreateColumnDefs({ show_details: true, show_checkbox: true });
    },
  },
  props: [],
  beforeCreate() {
  },
  created() {
  },
  beforeMount() {
    this.gridOptions = _.extend(this.commonGridOptions, {});
    this.initDatasource({ });
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
