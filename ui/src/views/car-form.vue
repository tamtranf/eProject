<template>
  <app-header></app-header>
  <div :class="[name, 'page']">
    <h1>This is the {{ name }} page {{ seqId }}</h1>
    <div class="row">
      <div class="col-6" style="">
        <!--
        Update 2022/08/25, the parameter :read="false" was not part of the code when the lesson was created.
        In the lesson #3014, it will be replaced to use the checkACL.
        You can remove these comment lines after reading it. -->
        <form-field v-for="f in formFieldsSideA" :key="f.id" :field_info="f"
        :read="checkACL(userAclAction.EDIT,aclRules.DATA_PAGES) === false"
        ></form-field>
      </div>
      <div class="col-6" style="">
        <!--
        Update 2022/08/25, the parameter :read="false" was not part of the code when the lesson was created.
        In the lesson #3014, it will be replaced to use the checkACL.
        You can remove these comment lines after reading it. -->
        <form-field v-for="f in formFieldsSideB"  :key="f.id" :field_info="f"
        :read="checkACL(userAclAction.EDIT,aclRules.DATA_PAGES) === false"
        ></form-field>
        <br>
        <button style="float:left;" class="btn btn-info" @click="goToPage('/car-list')">Back</button>
        <button style="float:right;" class="btn btn-primary" @click="onSave"
        :disabled="checkACL(userAclAction.EDIT,aclRules.DATA_PAGES) === false"
        >Save</button>
      </div>
      <rent_history style="margin: 0px;"  :car_id="seqId" :car_status="carStatus" @status_updated="statusUpdated" ></rent_history>

    </div>
  </div>
</template>
<script>
import mixinFormController from '@/mixins/form_controller';
import mixinLayoutComponents from '@/mixins/layout_components';
import _ from 'lodash';
import acl from '@/mixins/acl';
import rent_history from '@/components/sub_views/rent_history-list';
import { fields } from '../../../api/rules/fields_car';
import constants from '../../../api/rules/constants';

export default {
  name: 'car-form',
  data() {
    return {
      local_fields_ref_a: false,
      local_fields_ref_b: false,
      api_name: 'car',
      name: 'CarForm',
    };
  },
  routes: [
    {
      path: '/car-form/:seq_id',
      name: 'car-form',
    },
    {
      path: '/car-form',
      name: 'car-form-undefined',
    },
  ],
  mixins: [mixinLayoutComponents, mixinFormController, acl],
  components: { rent_history },
  computed: {
    carStatus() {
      return this.retrieved_value.status;
    },

    formFieldsSideA() {
      // This show the mode 1 to load the fields
      if (this.local_fields_ref_a === false) {
        this.local_fields_ref_a = this.setFormDefaultFields(['maker', 'model', 'license_plate', 'car_year', 'color', 'passenger'], fields);
      }
      return this.local_fields_ref_a;
    },

    formFieldsSideB() {
      // This show the mode 2 to load the fields
      const r = [
        _.extend(fields.category, {}),
        _.extend(fields.price_per_day, {}),
        _.extend(fields.weight, {}),
        _.extend(fields.status, {}),
        _.extend(fields.notes, {}),
      ];
      if (localStorage.entity_code === 'Super_admin') {
        r.push(fields.entity_code);
      }
      return r;
    },
    seqId() {
      if (this.$route.params && this.$route.params.seq_id) {
        return this.$route.params.seq_id;
      }
      return 'undefined';
    },
  },
  methods: {
    statusUpdated(data) {
      _.find(this.formFieldsSideB, (f) => f.id === 'status').ref_field.setValue(data.status);
    },

    loadFormData() {
      this.commonLoadRecord({}, (err, result) => {
        this.setFormFields(result.data);
        console.log('Load loadFormData ', this.seqId, { err, result });
        _.find(this.formFieldsSideB, (f) => f.id === 'status').ref_field.isDisabled = this.seqId !== constants.IDS.ADD_NEW_RECORD_ID;
      });
    },
    onSave() {
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
