<template>
  <app-header></app-header>
  <div class="about">
    <h1>About this page</h1>
    It is a sample template site called project "e".<br>
    When you create a new site using this template, rename it to you project name.
  </div>
</template>
<script>
import mixinLayoutComponents from '@/mixins/layout-components';

export default {
  name: 'About',
  routes: [
    {
      path: '/about',
      name: 'About',
    },
  ],
  mixins: [
    mixinLayoutComponents,
  ],
  components: {
  },
  beforeCreate() {
  },
  created() {
  },
  beforeMount() {
  },
  mounted() {
  },
  beforeUpdate() {
  },
  updated() {
  },
  beforeUnmount() {
  },
  unmounted() {
  },
  errorCaptured() {
  },
  renderTracked() {
  },
  renderTriggered() {
  },
  activated() {
  },
  deactivated() {
  },
};
</script>
