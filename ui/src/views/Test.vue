<template>
  <app-header></app-header>
  <div :class="[name]">
    <h1>Test page.</h1>

    <div class="row" style="">
      <div class="col-4" style=""></div>
      <div class="col-6" style="text-align: left">
        <div v-html="testResult"></div>

        <br><br><br><br>
        <div style="color:#8d8989" v-html="serverInfo"></div>
      </div>
    </div>
  </div>
</template>
<script>
import mixinLayoutComponents from '@/mixins/layout-components';
import constants from '../../../api/rules/constants';
import nseq from 'nseq';
import fields from '../../../api/rules/fields_master_user';
export default {
  name: 'test',
  data() {
    return {
      name: 'Test',
      test_time: 1,
      local_fields_ref: false,
      test_result: '',
      server_info:""
    };
  },
  routes: [
    {
      path: '/test',
      name: 'test',
    },
  ],
  mixins: [mixinLayoutComponents],
  components: {},
  computed: {
    serverInfo:{
      get(){
        return this.server_info;
      },
      set(v){
        this.server_info = v;
      }
    },
    testResult: {
      get() {
        return this.test_result;
      },
      set(v) {
        this.test_result = v;
      },
    },
    testTime: {
      get() {
        return this.test_time;
      },
      set(v) {
        this.test_time = v;
      },
    },
    formFields() {
      if (this.local_fields_ref == false) {
        this.local_fields_ref = fields.fields.array.filter((f) => {
          console.log('TEST DEBUG 211128 (33 at Test.vue)[18:11]: ', { f });
          return typeof f.label != 'undefined';
        });
      }
      return this.local_fields_ref;
    },
  },
  methods: {},
  beforeCreate() {
    console.log(this.name + ' beforeCreate');
  },
  created() {
    console.log(this.name + ' created');
  },
  beforeMount() {
    console.log(this.name + ' beforeMount');
  },
  mounted() {
    new nseq().do([
      (self) => {
        this.testResult += 'Starting the test!<br>';
        this.testResult += 'Test page javascript : ';
        setTimeout(() => {
          this.testResult += 'OK <br>';
          self.next();
        }, 100);
      },
      (self) => {
        this.testResult += 'Test access to API : ';
        this.$ajax.get('/test/access', (err, data) => {
          console.log('TEST DEBUG 211121 (34 at Test.vue)[18:27]: ', { err, data });
          if (err) {
            this.testResult += 'ERROR ' + err + ' <br>';
          }
          if (data.code == 123) {
            this.testResult += 'OK <br>';
            this.serverInfo = data.server_info
            self.next();
          } else {
            this.testResult += 'ERROR, unexpected result ' + JSON.stringify(data) + ' <br>';
          }
        });
      },
      (self) => {
        this.testResult += 'Test disk access at API : ';
        this.$ajax.get('/test/disk', (err, data) => {
          if (err) {
            this.testResult += 'ERROR ' + err + ' <br>';
          } else {
            this.testResult += 'OK <br>';
            self.next();
          }
        });
      },
      (self) => {
        this.testResult += 'Test database access at API : ';
        this.$ajax.get('/test/db', (err, data) => {
          if (err) {
            this.testResult += 'ERROR ' + err + ' <br>';
          } else {
            this.testResult += 'OK <br>';
            self.next();
          }
        });
      },
      (self) => {
        this.testResult += 'Test result: <span style="color:green">SUCCESS</span></b> </b><br>';
        self.next();
      },
      (self) => {
        self.next();
      },
    ]);
  },
  beforeUpdate() {
    console.log(this.name + ' beforeUpdate');
  },
  updated() {
    console.log(this.name + ' updated');
  },
  beforeUnmount() {
    console.log(this.name + ' beforeUnmount');
  },
  unmounted() {
    console.log(this.name + ' unmounted');
  },
  errorCaptured() {
    console.log(this.name + ' errorCaptured');
  },
  renderTracked() {
    console.log(this.name + ' renderTracked');
  },
  renderTriggered() {
    console.log(this.name + ' renderTriggered');
  },
  activated() {
    console.log(this.name + ' activated');
  },
  deactivated() {
    console.log(this.name + ' deactivated');
  },
};
</script>
<style scoped></style>
