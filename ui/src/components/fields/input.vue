<template>
  <div style="background: red" :class="{ 'col-12': true, 'form-control': true }">Field data sample for {{ fieldID }}</div>
</template>
<script>
export default {
  name: 'field-label',
  data() {
    return {
      name: 'Field label',
    };
  },
  mixins: [],
  components: {},
  computed: {
    fieldID() {
      console.log('TEST DEBUG 211128 (15 at input.vue)[17:51]: ', { test: this.$props['fieldInfo'] });
      return this.$props['fieldInfo'].id;
    },
  },
  methods: {},
  props: ['fieldInfo'],
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
