<template>
  <div :class="['app-header']">
    <div id="nav">
      <router-link to="/">Home</router-link>  |  <router-link to="/test">Test</router-link> | <router-link to="/about">About</router-link> |
       <router-link to="/template">Template</router-link> | <router-link to="/dev">Dev</router-link>
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
  computed: {},
  methods: {},
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
}

</style>
