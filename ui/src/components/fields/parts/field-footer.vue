<template>
  <span :class="{'col-4':true}"></span>
  <label v-bind:for="fieldID"
     :style="footerLabelStyle"
     :class="{'col-8':true, 'control-label':true}">
     {{fieldFooterLabel}}</label>
</template>
<script>
export default {
  name: 'field-label',
  data() {
    return {
      name: 'Field label',
      local_field_id: '',
      local_field_footer_label: '',
      local_footer_label_style: 'background:#c3c3ff',
    };
  },
  mixins: [],
  components: {},
  computed: {
    fieldFooterLabel: {
      get() {
        return this.$props.field_footer_label || this.local_field_footer_label;
      },
      set(v) {
        this.local_field_footer_label = v;
      },
    },
    footerLabelStyle: {
      get() {
        return this.$props.footer_label_style || this.local_footer_label_style;
      },
      set(v) {
        this.local_footer_label_style = v;
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
  props: ['field_id', 'footer_label_style', 'field_footer_label'],
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
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
