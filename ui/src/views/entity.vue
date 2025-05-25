<template>
  <app-header></app-header>
  <div :class="[name,'page']">
    <form style="margin-top: 50px;">
  <select v-model="selectedEntity" id="selected_entity_code" class="form-select" aria-label="Disabled select example">
  <option>Select an entiy</option> ]
  <option v-for="entity in entities" :key="entity.entity_code" :value="entity.entity_code">
        {{entity.entity_name }}
  </option>
</select>
  <button type="submit" class="btn btn-primary" style="margin-top: 10px" @click.prevent="click">Submit</button>
</form>

  </div>
</template>
<script>
import mixinLayoutComponents from '@/mixins/layout_components';
import _ from 'lodash';

export default {
  name: 'entity',
  data() {
    return {
      name: 'Entity',
      selectedEntity: '',

    };
  },
  routes: [
    {
      path: '/entity',
      name: 'entity',
      component: this,
      meta: { requireAuth: false },

    },
  ],
  mixins: [mixinLayoutComponents],
  components: {},
  computed: {
    entities() {
      return JSON.parse(localStorage.getItem('entities'));
    },

  },
  methods: {

    click() {
      const body = { selectedEntity: this.selectedEntity };

      if (this.selectedEntity.length < 1) {
        return this.$notify({
          title: 'Select Entity',
          type: 'error',
          text: 'Please select an entity',

        });
      }
      this.$ajax.post('/master_user/select_user_entity', body, (err, data) => {
        if (err) {
          this.$notify({
            title: 'Select Entity',
            type: 'error',
            text: 'Not allow to access',
          });
        }
        if (data.logged === true) {
          this.$router.push('/');
          const entity_code = body.selectedEntity;
          localStorage.setItem('entity_code', entity_code);

          const { entity_name } = _.find(this.entities, { entity_code });
          localStorage.setItem('entity_name', entity_name);

          const { acl_role } = data;
          localStorage.setItem('acl_role', acl_role);

          this.$notify({
            title: 'Select Entity',
            type: 'success',
            text: 'entity selected',
          });
        } else {
          this.$notify({
            title: 'Select Entity',
            type: 'error',
            text: 'Invalid entity',
          });
        }
      });
    },

  },
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
<style scoped>
button{
  float: right;
}
</style>
