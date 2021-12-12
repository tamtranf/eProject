<template>
  <app-header></app-header>
  <div class="home">
    <h1>Project "e"</h1>
    <br>
    <br><br><br>
    <img alt="Vue logo" src="../assets/logo.png" />
  </div>
  <div>{{now}}</div>
</template>

<script>
import mixinLayoutComponents from "@/mixins/layout-components";
export default {
  name: "Home",
  data() {
    return {
      name: "Home",
    };
  },
  mixins:[
    mixinLayoutComponents
  ],
  components: {
  },
  computed: {
    now(){
      return new Date();
    }
  },
  routes:  [
      {
        path: "/",
        name: "Home",
        component: this,
      },
    ],
};
</script>
