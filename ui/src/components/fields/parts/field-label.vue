<template>
  <label v-bind:for="fieldID"
     :style="labelStyle"
     :class="{'col-4':true, 'control-label':true}">
     {{fieldLabel}}</label>
</template>
<script>
export default {
  name: 'field-label',
  data() {
    return {
      name: 'Field label',
      local_field_id: '',
      local_field_label: '',
      local_label_style: 'background:#d8f3e1;',
    };
  },
  mixins: [],
  components: {},
  computed: {
    fieldLabel: {
      get() {
        return this.$props.field_info.label || this.local_field_label;
      },
      set(v) {
        this.local_field_label = v;
      },
    },
    labelStyle: {
      get() {
        return this.$props.label_style || this.local_label_style;
      },
      set(v) {
        this.local_label_style = v;
      },
    },
    fieldID: {
      get() {
        return this.$props.field_id || this.local_field_id;
      },
      set(v) {
        this.local_field_id = v;
      },
    },
  },
  methods: {},
  props: ['field_info', 'field_id', 'label_style'],
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.$props.field_info.ref_local_field_label = this;
  },
  beforeUpdate() {},
  updated() {},
  beforeUnmount() {},
  unmounted() {},
  errorCaptured() {},
  renderTracked() {},
  renderTriggered() {},
  activated() {},
  deactivated() {},
};
</script>
<style scoped></style>
