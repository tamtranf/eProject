export default {
  emits: ['on_update', 'error_msg'],
  data() {
    return {
      is_disabled: false,
      is_ready_only: false,
      local_refresh_sequence: 1,
      refresher: '',
      field_value: '',
      value_changed: false,
    };
  },
  computed: {
    isDisabled: {
      get() {
        return this.is_disabled;
      },
      set(v) {
        this.is_disabled = v;
      },
    },
    isReadyOnly: {
      get() {
        return this.is_ready_only;
      },
      set(v) {
        this.is_ready_only = v;
      },
    },

    fieldType() {
      return this.$props.fieldInfo.field_type || 'text';
    },
    minVal() {
      return this.$props.fieldInfo.min_length || null;
    },
    maxVal() {
      return this.$props.fieldInfo.max_length || null;
    },
    fieldID() {
      return this.$props.fieldInfo.id;
    },
    fieldStyle() {
      return this.$props.fieldInfo.style || '';
    },
    isReadOnly() {
      return this.$props.fieldInfo.read_only || false;
    },
    localRefreshSequence: {
      get() {
        return this.local_refresh_sequence;
      },
      set(v) {
        this.local_refresh_sequence = v;
      },
    },
    stateCurrentRow: {
      get() {
        return this.state_current_row || '';
      },
      set(v) {
        this.state_current_row = v;
      },
    },
    valueChanged: {
      get() {
        return this.value_changed;
      },
      set(v) {
        this.value_changed = v;
      },
    },
  },
  methods: {
    setValue(v) {
      this.refresher = this.refresher === ' ' ? '' : ' ';
      this.field_value = v;
    },
    getValue() {
      return this.field_value;
    },
    onLocalUpdateValue(v) {
      this.valueChanged = true;
      this.$emit('on_update', v);
      if (this.onUpdateValue) {
        this.onUpdateValue({ value: v, field: this.fieldID });
      }
    },
  },
  mounted() {
    this.$props.fieldInfo.ref_field = this;
  },
  props: ['fieldInfo', 'option', 'read_only'],
};
