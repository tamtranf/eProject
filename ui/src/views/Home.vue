<template>
  <app-header></app-header>
  <div :class="[name,'page']">
    <h1>Project "e"</h1>
    <br />
    <br /><br /><br />
    <img alt="Vue logo" src="../assets/logo.png" />
    <div>{{ now }}</div>
  </div>
</template>

<script>
import mixinLayoutComponents from '@/mixins/layout_components';

export default {
  name: 'e-home',
  data() {
    return {
      name: 'Home',
    };
  },
  mixins: [mixinLayoutComponents],
  components: {},
  computed: {
    now() {
      return new Date();
    },
  },
  routes: [{ path: '/', name: 'Home', component: this }],
};
</script>
<style scoped>
.Home{
  text-align: center;
}
</style>
