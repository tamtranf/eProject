<template>
  <app-header></app-header>
  <div :class="[name,'page']">
    <h1>This is the {{ name }} page. Time:{{ testTime }}</h1>
    <div >
      <div class="col-6" style="">
        <form-field v-for="f in formFields" :key="f.id" :field_info="f" ></form-field>
        <button class="btn btn-primary" style="float: right;" @click="testbBtn"> Test</button>
      </div>

      <div class="col-12" style="">
        <ag-grid-vue style="width: 800px; height: 200px;"
            class="ag-theme-alpine"
            :columnDefs="columnDefs"
            :rowData="rowData">
        </ag-grid-vue>
      </div>
    </div>
  </div>
</template>
<script>
import mixinLayoutComponents from '@/mixins/layout_components';
import mixinFormController from '@/mixins/form_controller';
// import constants from '../../../api/rules/constants';
import { AgGridVue } from 'ag-grid-vue3';
import fields from '../../../api/rules/fields_master_dev';

export default {
  name: 'dev',
  data() {
    return {
      name: 'Dev',
      test_time: 1,
      local_fields_ref: false,
      columnDefs: [
        { headerName: 'Make', field: 'make' },
        { headerName: 'Model', field: 'model' },
        { headerName: 'Price', field: 'price' },
      ],
      rowData: [
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 },
      ],
    };
  },
  routes: [
    {
      path: '/dev',
      name: 'dev',
    },
  ],
  mixins: [mixinLayoutComponents, mixinFormController],
  components: { AgGridVue },
  computed: {

    formFields() {
      if (this.local_fields_ref === false) {
        this.local_fields_ref = fields.fields.array.filter((f) => typeof f.label !== 'undefined');
      }
      return this.local_fields_ref;
    },
    testTime: {
      get() {
        return this.test_time;
      },
      set(v) {
        this.test_time = v;
      },
    },
  },
  methods: {
    testbBtn() {
      const values = this.getFormFieldsValues();
      console.log('TEST BTN: ', values);
    },
  },

  beforeCreate() {
    console.log(`${this.name} beforeCreate`);
  },
  created() {
    console.log(`${this.name} created`);
  },
  beforeMount() {
    console.log(`${this.name} beforeMount`);
  },
  mounted() {
    // this.local_fields_ref[0].ref_field.valueModel = `v ${this.testTime}`;

    // setInterval(() => {
    // //   this.testTime += 1;
    // //   this.local_fields_ref[0].orig_label = this.local_fields_ref[0].orig_label || this.local_fields_ref[0].label;
    // //   this.local_fields_ref[0].label = `${this.local_fields_ref[0].orig_label} : ${this.testTime}`;
    // //   this.local_fields_ref[0].label = `${this.local_fields_ref[0].orig_label} : ${this.testTime}`;
    // //   this.local_fields_ref[0].ref_field.setValue(`v ${this.testTime}`);
    // }, 2000);
    // setInterval(() => {
    // }, 1000);
    // this.local_fields_ref[0].ref_field.onUpdateValue = (v) => {
    // };
    // console.log(`${this.name} mounted`);
    // this.$ajax.get('/test/', (err, data) => {
    // });
    const test_data = {
      seq_id: 1,
      user_id: 'test_user',
      user_shimei: 'Test user name',
      login_failure_count: 37,
      password: '1234567',
      my_date1: '2021/12/20 12:43',
      my_date2: '2021/12/21 12:45',
      test1: 'opt3',
      test2: 'opt2',
      test3: 215,
    };
    this.setFormFields(test_data);
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
  renderTracked() {

  },
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
<style scoped></style>
