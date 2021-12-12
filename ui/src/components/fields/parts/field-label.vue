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
      _field_id:"",
      _field_label:"",
      _label_style:"background:grey;"
    };
  },
  mixins: [],
  components: {},
  computed: {
    fieldLabel:{
      get(){
        console.log('TEST DEBUG 211128 (22 at field-label.vue)[18:22]: ', { test_field:this.$props.field_info });
        return this.$props.field_info.label || this._field_label;
      },
      set(v){
        this._field_label = v;
      }
    },
    labelStyle:{
      get(){
        return this.$props.label_style || this._label_style;
      },
      set(v){
        this._label_style = v;
      }
    },
    fieldID:{
      get(){
        return this.$props.field_id || this._field_id;
      },
      set(v){
        this._field_id = v;
      }
    },
  },
  methods: {},
  props: ["field_info","field_id","label_style"],
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.$props.field_info.ref_field_label = this;
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
