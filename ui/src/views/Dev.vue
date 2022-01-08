<template>
  <app-header></app-header>
  <div :class="[name]">
    <h1>This is the {{ name }} page. Time:{{ testTime }}</h1>

    <div class="col-6" style="">
      <form-field v-for="f in formFields" :key="f.id" :field_info="f"></form-field>
    </div>
  </div>
</template>
<script>
import mixinLayoutComponents from '@/mixins/layout-components';
// import constants from '../../../api/rules/constants';
import fields from '../../../api/rules/fields_master_user';

export default {
  name: 'dev',
  data() {
    return {
      name: 'Dev',
      test_time: 1,
      local_fields_ref: false,
    };
  },
  routes: [
    {
      path: '/dev',
      name: 'dev',
    },
  ],
  mixins: [mixinLayoutComponents],
  components: {},
  computed: {
    formFields() {
      if (this.local_fields_ref === false) {
        this.local_fields_ref = fields.fields.array.filter((f) => typeof f.label !== 'undefined');
      }
      return this.local_fields_ref;
    },
    testTime: {
      get() {
        return this.test_time;
      },
      set(v) {
        this.test_time = v;
      },
    },
  },
  methods: {},

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
    setInterval(() => {
      this.testTime += 1;
      this.local_fields_ref[0].orig_label = this.local_fields_ref[0].orig_label || this.local_fields_ref[0].label;
      this.local_fields_ref[0].label = `${this.local_fields_ref[0].orig_label} : ${this.testTime}`;
    }, 100000);
    console.log(`${this.name} mounted`);
    this.$ajax.get('/test/', (err, data) => {
      console.log('TEST DEBUG 220108 (67 at Dev.vue)[21:42]: ', { err, data });
    });
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
  renderTracked() {
    console.log(`${this.name} renderTracked`);
  },
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
