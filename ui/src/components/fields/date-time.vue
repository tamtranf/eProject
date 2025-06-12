<template>

<v-date-picker
  v-model="field_value"
  :mode="pickerMode"
  locale = "ja"
  :masks="masks"
  :popover="{ placement: 'bottom', visibility: 'click' }"

  is24hr>
  <template v-slot = "{ inputValue, inputEvents }">
    <input

      :id="fieldID"
      :name="fieldID"
       :disabled="isDisabled || isReadOnly"
      :style="fieldStyle"
      class="form-control bg-white text-gray-700 w-full py-1 px-2 appearance-none border rounded-r focus:outline-none focus:border-blue-500"
      :value="inputValue"
      v-on="inputEvents"
      autocomplete="off"
      :readonly="isReadOnly"
      :placeholder="fieldID"

    />
  </template>
</v-date-picker>
  {{ refresher }}
</template>
<script>
import common_field from '@/components/fields/mixins/common_field';
// import date_time_picker from '@/components/fields/parts/date-time-picker';
import { DatePicker } from 'v-calendar';
import moment from 'moment';

export default {
  mixins: [common_field],
  name: 'field-date-time',
  data() {
    return {
      watch_is_disabled: false,

    };
  },
  watch: {
    field_value(value) {
      if (this.watch_is_disabled === false) {
        if (value === '' || value === null || value === false) {
          this.onLocalUpdateValue('');
        } else if (this.$props.fieldInfo.show_time === true) {
          this.onLocalUpdateValue(moment(value).format('YYYY/MM/DD HH:mm:ss'));
        } else {
          this.onLocalUpdateValue(moment(value).format('YYYY/MM/DD'));
        }
      }
    },
  },
  components: {
    'v-date-picker': DatePicker,
  },
  computed: {
    pickerMode() {
      return (this.$props.fieldInfo.show_time) ? 'dateTime' : 'date';
    },
    masks() {
      const m = {};
      if (this.$props.fieldInfo.format) {
        m.input = this.$props.fieldInfo.format;
        m.inputDateTime24hr = this.$props.fieldInfo.format;
      }
      return m;
    },
  },
  methods: {
    // onDateLocalUpdateValue(v) {
    // },
    getValue() {
      if (this.field_value === '' || this.field_value === null || this.field_value === false) {
        return '';
      } if (this.$props.fieldInfo.show_time === true) {
        return moment(this.field_value).format('YYYY/MM/DD HH:mm:ss');
      }
      return moment(this.field_value).format('YYYY/MM/DD');
    },
    setValue(v) {
      this.refresher = this.refresher === ' ' ? '' : ' ';
      if (this.field_value === '' && v !== '' && this.field_value === null && v !== null) {
        this.watch_is_disabled = true;
        setTimeout(() => {
          this.watch_is_disabled = false;
        }, 500);
      }
      this.field_value = new Date(v);
    },
  },
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
