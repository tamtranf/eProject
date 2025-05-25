import constants from '../../../api/rules/constants';
import acl_rules from '../../../api/rules/acl_rules';

export default {
  data() {
    return {
      roles_permissions: false,
      page_acl: null,
    };
  },
  computed: {
    aclRules() {
      return acl_rules;
    },
    userAclAction() {
      return constants.ACL_ACTION;
    },
  },
  methods: {
    getUserRoles() {
      if (this.roles_permissions === false) {
        const temp = localStorage.getItem('acl_role') || constants.ACL_ROLE.NONE;
        this.roles_permissions = constants.ACL_ROLE[temp] || constants.ACL_ROLE.NONE;
      }
      return this.roles_permissions;
    },
    checkACL(action, requested_page_acl = null, _requester = '') {
      let page_acl = this.page_acl || null;
      if (requested_page_acl !== null) {
        page_acl = requested_page_acl;
      }
      const user_role = this.getUserRoles();
      if (page_acl && Array.isArray(page_acl[action]) && page_acl[action].indexOf(user_role) > -1) {
        return true;
      }
      return false;
    },
  },
};
