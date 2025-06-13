<template>
<div
  class="modal fade"
  ref="confirmationModal"
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
        <h5 class="modal-title" id="staticBackdropLabel">{{ title }}</h5>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
          @click="onClose('no')"
        ></button>
      </div>

      <div class="modal-body">
        <div class="row">
            <div class="col-12" v-html="text">

            </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" :class="['btn', cancel_class]" @click="onClose('no')"> {{cancel_text}} </button>
        <button type="button" class="btn btn-primary" @click="onClose('yes')"> {{ok_text}} </button>
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

export default {
  name: '',
  data() {
    return {
      local_fields_ref_a: false,
      local_fields_ref_b: false,
      api_name: '',
      name: '',
      modalElem: null,
      title: 'Modal',
      text: 'Text',
      ok_text: 'OK',
      cancel_text: 'Cancel',
      ok_class: 'btn-primary',
      cancel_class: 'btn-secondary',
      on_confirm: () => {},
    };
  },

  mixins: [mixinLayoutComponents, mixinFormController, acl],
  components: {},
  computed: {

  },
  methods: {
    onClose(data) {
      this.modalElem.hide();
      this.on_confirm(data);
    },
    showModal(data) {
      this.modalElem.show();
      this.title = data.title;
      this.text = data.text;
      this.ok_text = data.ok_text;
      this.cancel_text = data.cancel_text;
      this.ok_class = data.ok_class;
      this.cancel_class = data.cancel_class;
      this.on_confirm = data.on_confirm;
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
    this.modalElem = new Modal(this.$refs.confirmationModal);
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
