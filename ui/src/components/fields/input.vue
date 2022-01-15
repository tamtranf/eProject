<template>
  <input
  @input="onLocalUpdateValue($event.target.value)"
  v-model="field_value"
  :type="fieldType || 'text'"
  class="form-control"
  :style="fieldStyle"
  :disabled="isDisabled"
  :min="minVal"
  :max="maxVal"
  :id="fieldID"
  :name="fieldID"
  :read_only="isReadOnly"
  :placeholder="fieldID" />
  {{ refresher }}
</template>
<script>
import common_field from '@/components/fields/mixins/common_field';

export default {
  mixins: [common_field],
  name: 'field-input',
  data() {
    return {};
  },
  components: {},
  computed: {},
  methods: {},
  props: [],
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
