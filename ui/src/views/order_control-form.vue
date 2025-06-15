<template>
  <app-header></app-header>
  <div :class="[name, 'page']">
    <h1>This is the {{ name }} page {{ seqId }}</h1>
    <div class="row">
      <div class="col-4" style="">
        <!--
        Update 2022/08/25, the parameter :read="false" was not part of the code when the lesson was created.
        In the lesson #3014, it will be replaced to use the checkACL.
        You can remove these comment lines after reading it. -->
        <form-field v-for="f in formFieldsSideA" :read="false"  :key="f.id" :field_info="f"></form-field>
      </div>
      <div class="col-4" style="">
        <!--
        Update 2022/08/25, the parameter :read="false" was not part of the code when the lesson was created.
        In the lesson #3014, it will be replaced to use the checkACL.
        You can remove these comment lines after reading it. -->
        <form-field v-for="f in formFieldsSideB" :read="false"  :key="f.id" :field_info="f"></form-field>
        <br>
      </div>
       <div class="col-4" style="">
        <!--
        Update 2022/08/25, the parameter :read="false" was not part of the code when the lesson was created.
        In the lesson #3014, it will be replaced to use the checkACL.
        You can remove these comment lines after reading it. -->
        <form-field v-for="f in formFieldsSideC" :read="false"  :key="f.id" :field_info="f"></form-field>
        <br>
        <button style="float:right;" class="btn btn-primary" @click="onSave">Save</button>
        <idleCarSearchModal v-if="is_new === false && seqId > 0&& carCodeId ===''" @selected="onSelectedCar"> </idleCarSearchModal>
      </div>
    </div>
  </div>
</template>
<script>
import mixinFormController from '@/mixins/form_controller';
import mixinLayoutComponents from '@/mixins/layout_components';
import _ from 'lodash';
import idleCarSearchModal from '@/components/modals/idle-car-search-modal';
import { fields } from '../../../api/rules/fields_order_control';

export default {
  name: 'order_control-form',
  data() {
    return {
      local_fields_ref_a: false,
      local_fields_ref_b: false,
      api_name: 'order_control',
      name: 'OrderControlForm',
    };
  },
  routes: [
    {
      path: '/order_control-form/:seq_id',
      name: 'order_control-form',
    },
    {
      path: '/order_control-form',
      name: 'order_control-form-undefined',
    },
  ],
  mixins: [mixinLayoutComponents, mixinFormController],
  components: { idleCarSearchModal },
  computed: {
    carCodeId() { return this.retrieved_value.car_code_id || ''; },
    formFieldsSideA() {
      return [
        _.extend(fields.customer_name, { read_only: true }),
        _.extend(fields.phone_number, { read_only: true }),
        _.extend(fields.postal_code, { read_only: true }),
        _.extend(fields.address, { read_only: true }),
        _.extend(fields.created_date, { read_only: true }),
        _.extend(fields.customer_notes, { read_only: true }),
        _.extend(fields.start_date, { read_only: true }),
        _.extend(fields.end_date, { read_only: true }),
        _.extend(fields.entity_code, { read_only: true }),
        _.extend(fields.car_price, { read_only: true }),
      ];
    },

    formFieldsSideB() {
      return [
        _.extend(fields.model, { read_only: true }),
        _.extend(fields.license_plate, { read_only: true }),
        _.extend(fields.car_year, { read_only: true }),
        _.extend(fields.passenger, { read_only: true }),
        _.extend(fields.weight, { read_only: true }),
        _.extend(fields.car_status, { read_only: true }),
        _.extend(fields.car_notes, { read_only: true }),
        _.extend(fields.maker_name, { read_only: true }),
        _.extend(fields.year_name, { read_only: true }),
        _.extend(fields.color_name, { read_only: true }),
        _.extend(fields.category_name, { read_only: true }),
      ];
    },

    formFieldsSideC() {
      return [
        _.extend(fields.order_id, { read_only: true }),
        _.extend(fields.customer_id, { read_only: true }),
        _.extend(fields.car_code_id, { read_only: true }),
        _.extend(fields.full_name, { read_only: true }),
        _.extend(fields.status, { read_only: true }),
        _.extend(fields.total_value, { read_only: true }),
        _.extend(fields.notes, {}), // Cho phép ghi chú
      ];
    },

    seqId() {
      if (this.$route.params && this.$route.params.seq_id) {
        return this.$route.params.seq_id;
      }
      return 'undefined';
    },
  },
  methods: {
    onSelectedCar(car_data) {
      _.find(this.formFieldsSideC, (f) => f.id === 'car_code_id').ref_field.setValue(car_data.code_id);
      this.onSave(this.loadFormData);
    },

    loadFormData() {
      this.commonLoadRecord({}, (err, result) => {
        this.setFormFields(result.data);
        console.log('Load loadFormData ', this.seqId, { err, result });
      });
    },
    onSave(cb = () => {}) {
      const changes = this.getFormFieldsValues(false);
      this.commonSaveRecord(changes, {}, (err, result) => {
        if (err) {
          this.$notify({
            type: 'error',
            title: 'Error',
            text: err,
          });
        } else {
          this.$notify({
            type: 'success',
            title: 'Saved',
            text: 'Success',
          });
          _.find(this.formFieldsSideC, (f) => f.id === 'order_id').ref_field.setValue(result.data.order_id);
          if (this.is_new && result.data.seq_id !== this.seqId) {
            this.$route.params.seq_id = result.data.seq_id;
            this.is_new = false;

            return this.$router.push({
              name: this.detail_page,
              params: { seq_id: result.data.seq_id },
            });
          }
        }
      });
      if (typeof cb == 'function') { cb(); }
    },
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
  },
  mounted() {
    console.log(`${this.name} mounted`);
    if (this.seqId === 'new') {
      this.is_new = true;
    } else {
      this.loadFormData();
    }
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
<style scoped></style>
