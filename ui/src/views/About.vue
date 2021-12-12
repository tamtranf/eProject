<template>
  <app-header></app-header>
  <div class="about">
    <h1>About this page</h1>
    It is a sample template site called project "e".<br>
    When you create a new site using this template, rename it to you project name.
  </div>
</template>
<script>
import mixinLayoutComponents from "@/mixins/layout-components";
export default {
  name: "About",
  routes: [
    {
      path: "/about",
      name: "About",
    },
  ],
  mixins:[
    mixinLayoutComponents
  ],
  components: {
  },
  beforeCreate() {
    console.log("TEST DEBUG 211121 (18 at About.vue)[13:04]: ", {
      m: "beforeCreate",
    });
  },
  created() {
    console.log("TEST DEBUG 211121 (19 at About.vue)[13:04]: ", {
      m: "created",
    });
  },
  beforeMount() {
    console.log("TEST DEBUG 211121 (20 at About.vue)[13:04]: ", {
      m: "beforeMount",
    });
  },
  mounted() {
    console.log("TEST DEBUG 211121 (21 at About.vue)[13:04]: ", {
      m: "mounted",
    });
  },
  beforeUpdate() {
    console.log("TEST DEBUG 211121 (22 at About.vue)[13:04]: ", {
      m: "beforeUpdate",
    });
  },
  updated() {
    console.log("TEST DEBUG 211121 (23 at About.vue)[13:04]: ", {
      m: "updated",
    });
  },
  beforeUnmount() {
    console.log("TEST DEBUG 211121 (24 at About.vue)[13:04]: ", {
      m: "beforeUnmount",
    });
  },
  unmounted() {
    console.log("TEST DEBUG 211121 (25 at About.vue)[13:04]: ", {
      m: "unmounted",
    });
  },
  errorCaptured() {
    console.log("TEST DEBUG 211121 (26 at About.vue)[13:04]: ", {
      m: "errorCaptured",
    });
  },
  renderTracked() {
    console.log("TEST DEBUG 211121 (27 at About.vue)[13:04]: ", {
      m: "renderTracked",
    });
  },
  renderTriggered() {
    console.log("TEST DEBUG 211121 (28 at About.vue)[13:04]: ", {
      m: "renderTriggered",
    });
  },
  activated() {
    console.log("TEST DEBUG 211121 (29 at About.vue)[13:04]: ", {
      m: "activated",
    });
  },
  deactivated() {
    console.log("TEST DEBUG 211121 (30 at About.vue)[13:04]: ", {
      m: "deactivated",
    });
  },
};
</script>
