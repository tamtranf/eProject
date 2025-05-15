<template>
<div class="row">
<div class="col-4"></div>
<div class="col-4">
 <form>
  <div class="form-group">
    <label for="exampleInputEmail1">Email address</label>
    <input type="email" class="form-control" id="exampleInputEmail1" v-model="username"  placeholder="Enter email">
    <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
  </div>
  <div class="form-group">
    <label for="exampleInputPassword1">Password</label>
    <input type="password" class="form-control" id="exampleInputPassword1" v-model="password" placeholder="Password">
  </div>

  <button type="submit" class="btn btn-primary" @click.prevent="click">Submit</button>
</form>
</div>
<div class="col-4"></div>
</div>

</template>
<script>
import mixinLayoutComponents from '@/mixins/layout_components';
import { notify } from '@kyvg/vue3-notification';

export default {
  name: 'login',
  data() {
    return {
      name: 'Login',
    };
  },
  routes: [
    {
      path: '/login',
      name: 'Login',
    },
  ],
  mixins: [mixinLayoutComponents],
  components: {},
  computed: {},
  methods: {
    click() {
      const body = {
        username: this.username,
        password: this.password,
      };
      this.$ajax.post('/master_user/login/', body, (err, data) => {
        if (data.logged === true) {
          this.$notify({
            title: 'Login',
            text: 'Login success',
            type: 'success',
          });
          this.$router.push('/');
        } else {
          this.$notify({
            title: 'Login',
            text: 'Invalid username or password',
            type: 'error',
          });
        }
        if (err) {
          this.$notify({
            title: 'error',
            text: err,
            type: 'error',
          });
        }
      });
    },

  },
  //   data() {
  //     return {
  //       username: '',
  //       password: '',
  //     };
  //   },
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
    console.log(`${this.name} mounted`);
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
