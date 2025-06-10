<template>
  <div :class="['app-header']">
    <div id="nav">
      <router-link to="/">Home</router-link>  |
       <router-link to="/templates">Templates</router-link> |  <router-link to="/test_3004">Test</router-link>
       | <router-link to="/car-list">Car</router-link> | <router-link to="/master_entity-list">Master Entity</router-link>
       | <router-link to="/master_user-list">Master User</router-link>| <router-link to="/master_user_permission-list">Master User Permission</router-link>
        |<router-link to="/master_maker-list">Master Maker</router-link>|<router-link to="/master_year-list">Master Year</router-link>
        |<router-link to="/master_color-list">Master Color</router-link>|<router-link to="/master_category-list">Master Category</router-link>
       |<router-link to="/customer-list">Customer</router-link>
       <span  style="float: right;">
       <button class="btn btn-warning" @click.prevent="logout">Log out</button>
       <br>
{{logged_user}}
<br>
{{selected_entity}}
       </span>

    </div>
  </div>
</template>
<script>
// @ is an alias to /src
export default {
  name: 'app-header',
  data() {
    return {
      name: 'app-header',
    };
  },
  computed: {
    logged_user() {
      return localStorage.getItem('full_name');
    },
    selected_entity() {
      return localStorage.getItem('entity_name');
    },
  },
  methods: {
    goToPage(path) {
      this.$router.push({ path });
    },
    logout() {
      this.$ajax.post('/master_user/logout/', {}, (err) => {
        if (err) {
          this.$notify({
            title: 'logout',
            text: err,
            type: 'err',
          });
        } else {
          this.$notify(
            {
              title: 'logout',
              text: 'Log out success',
            },
          );
          return this.$router.push({
            name: 'Login',
            params: {},

          });
        }
      });
    },
  },
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
<style scoped>
.app-header{
  background-color:rgb(112, 189, 197);
  height: 115px;
}

</style>
