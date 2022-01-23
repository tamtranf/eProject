<template>
  <app-header></app-header>
  <div :class="[name,'page']">
    <h1>This is the {{ name }} page</h1>
    <ul>
      <li><router-link to="/template-list">Template for list </router-link></li>
      <li><router-link to="/template-form">Template for form </router-link></li>
    </ul>
  </div>
</template>
<script>
import mixinLayoutComponents from '@/mixins/layout_components';

export default {
  name: 'template',
  data() {
    return {
      name: 'Template',
    };
  },
  routes: [
    {
      path: '/templates',
      name: 'templates',
    },
  ],
  mixins: [mixinLayoutComponents],
  components: {},
  computed: {},
  methods: {},
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
