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
        <form-field v-for="f in formFieldsSideA" :read="false"  :key="f.id" :field_info="f"></form-field>
      </div>
      <div class="col-6" style="">
        <!--
        Update 2022/08/25, the parameter :read="false" was not part of the code when the lesson was created.
        In the lesson #3014, it will be replaced to use the checkACL.
        You can remove these comment lines after reading it. -->
        <form-field v-for="f in formFieldsSideB" :read="false"  :key="f.id" :field_info="f"></form-field>
        <br>
        <button style="float:right;" class="btn btn-primary" @click="onSave">Save</button>
      </div>
      <link_accessory_car style="margin: 0;"  v-if="is_new === false && seqId > 0 && codeID && codeID.length > 0"  :accessory_code_id="codeID"></link_accessory_car>

    </div>
  </div>
</template>
<script>
import mixinFormController from '@/mixins/form_controller';
import mixinLayoutComponents from '@/mixins/layout_components';
import _ from 'lodash';
import link_accessory_car from '@/components/sub_views/link-accessory-car';
import { fields } from '../../../api/rules/fields_accessory';

export default {
  name: 'accessory-form',
  data() {
    return {
      local_fields_ref_a: false,
      local_fields_ref_b: false,
      api_name: 'accessory',
      name: 'AccessoryForm',
    };
  },
  routes: [
    {
      path: '/accessory-form/:seq_id',
      name: 'accessory-form',
    },
    {
      path: '/accessory-form',
      name: 'accessory-form-undefined',
    },
  ],
  mixins: [mixinLayoutComponents, mixinFormController],
  components: { link_accessory_car },
  computed: {
    codeID() { return this.retrieved_value.code_id; },

    formFieldsSideA() {
      // This show the mode 1 to load the fields
      if (this.local_fields_ref_a === false) {
        this.local_fields_ref_a = this.setFormDefaultFields(['category', 'code_id', 'name'], fields);
      }
      return this.local_fields_ref_a;
    },

    formFieldsSideB() {
      // This show the mode 2 to load the fields
      const r = [
        _.extend(fields.color, {}),
        _.extend(fields.notes, {}),
        _.extend(fields.entity_code, {}),
      ];
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
    loadFormData() {
      this.commonLoadRecord({}, (err, result) => {
        this.setFormFields(result.data);
        console.log('Load loadFormData ', this.seqId, { err, result });
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
