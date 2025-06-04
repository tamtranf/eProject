<template>
<div
  class="modal fade"
  ref="modalIDNew"
  id="staticBackdrop"
  data-bs-backdrop="static"
  data-bs-keyboard="false"
  tabindex="-1"
  aria-labelledby="staticBackdropLabel"
  aria-hidden="true"
>
  <div class="modal-dialog">
    <div class="modal-content">

      <div class="modal-header">
        <h5 class="modal-title" id="staticBackdropLabel">New Rent</h5>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>

      <div class="modal-body">
        <div class="row">
            <div class="col-12">
            <form-field
            v-for="f in formFieldsSideA"
            :key="f.id"
            :read="false"
            :field_info="f"
            ></form-field>
            </div>
        </div>
      </div>

      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          data-bs-dismiss="modal"
        >
          Close
        </button>
        <button
          type="button"
          class="btn btn-primary"
          @click="onSave"
        >
          Save
        </button>
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
import { fields } from '../../../../api/rules/fields_rent_history';

export default {
  name: 'ren_history_form',
  data() {
    return {
      local_fields_ref_a: false,
      local_fields_ref_b: false,
      api_name: 'rent_history',
      name: 'ren_history_form',
      modalElem: null,
    };
  },

  mixins: [mixinLayoutComponents, mixinFormController, acl],
  components: {},
  computed: {
    carID() {
      return this.car_id;
    },
    formFieldsSideA() {
      // This show the mode 1 to load the fields
      if (this.local_fields_ref_a === false) {
        this.local_fields_ref_a = this.setFormDefaultFields(['customer_name', 'from_date', 'notes'], fields);
      }
      return this.local_fields_ref_a;
    },
    seqId() {
      if (this.$route.params && this.$route.params.seq_id) {
        return this.$route.params.seq_id;
      }
      return 'undefined';
    },
  },
  methods: {
    showModal() {
      this.modalElem.show();
      _.find(this.formFieldsSideA, (f) => f.id === 'from_date').ref_field.setValue(new Date());
      _.find(this.formFieldsSideA, (f) => f.id === 'customer_name').ref_field.setValue('');
      _.find(this.formFieldsSideA, (f) => f.id === 'notes').ref_field.setValue('');
    },

    loadFormData() {
      this.commonLoadRecord({}, (err, result) => {
        this.setFormFields(result.data);
        console.log('Load loadFormData ', this.seqId, { err, result });
      });
    },
    onSave() {
      const changes = this.getFormFieldsValues(false);
      changes.car_id = this.carID;
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
            this.modalElem.hide();
            this.$emit('updated', { status: 'Rented', id: result.data.seq_id });
          }
          //     this.$route.params.seq_id = result.data.seq_id;
          //     this.is_new = false;

        //     return this.$router.push({
        //       name: this.detail_page,
        //       params: { seq_id: result.data.seq_id },
        //     });
        //   }
        }
      });
    },
  },
  props: ['car_id'],
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
    this.modalElem = new Modal(this.$refs.modalIDNew);
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
<style scoped></style>
