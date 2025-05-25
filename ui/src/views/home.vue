<template>
  <app-header></app-header>
  <div :class="[name,'page']">
    <h1>Project "e"</h1>
    <div class="row">
    <div class="col-4">
    <button type="button" class="btn btn-primary" @click="goToPage('/master_entity-list')"
    v-show="checkACL(userAclAction.READ,aclRules.SETTING_PAGES)"
    >Entity</button>

    <button type="button" class="btn btn-primary" @click="goToPage('/master_user-list')"
    v-show="checkACL(userAclAction.READ,aclRules.SETTING_PAGES)"
    >User</button>

    <button type="button" class="btn btn-primary" @click="goToPage('/car-list')"
    v-show="checkACL(userAclAction.READ,aclRules.DATA_PAGES)"
    >Car</button>
    </div>

    <div class="col-4">
    <button type="button" class="btn btn-primary" @click="goToPage('/master_user_permission-list')"
    :disabled="checkACL(userAclAction.READ,aclRules.SETTING_PAGES) === false"
    >Permission</button>
    </div>

    <div class="col-4">
    <button type="button" class="btn btn-primary">Primary</button>
    <button type="button" class="btn btn-primary">Primary</button>
    <button type="button" class="btn btn-primary">Primary</button>
    </div>
    </div>
    <br />
    <br /><br /><br />
    <img alt="Vue logo" src="../assets/logo.png" />
    <div>{{ now }}</div>
  </div>
</template>

<script>
import mixinLayoutComponents from '@/mixins/layout_components';
import acl from '@/mixins/acl';

export default {
  name: 'e-home',
  data() {
    return {
      name: 'Home',
    };
  },
  mixins: [mixinLayoutComponents, acl],
  components: {},
  computed: {
    now() {
      return new Date();
    },
  },
  methods: {
    goToPage(path) {
      this.$router.push({ path });
    },
  },
  routes: [{
    path: '/', name: 'Home', component: this, meta: { requiresAuth: true },
  }],
};
</script>
<style scoped>
.Home{
  text-align: center;
}
button{
  width: 100%;
  margin-bottom: 10px;
  padding: 5px;
}
</style>
