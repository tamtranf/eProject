<template>
  <div :class="[name,'page']">
    <h5>Accessories</h5>
    <div class="col-12" style="">
      <ag-grid-vue style="width: 100%; height: 325px;"
        class="ag-theme-blue"
        :gridOptions="gridOptions"
        >
      </ag-grid-vue>
      <br>
      <button style="float:right;" class="btn btn-primary" @click="onAddNew"
      :disabled="checkACL(userAclAction.ADD,aclRules.DATA_PAGES) === false"
      >New</button>
      <button style="float:right;margin-right:10px" class="btn btn-danger"
      :disabled="deleteDisabled" @click="onDeleteSelected">Delete</button>
    </div>
    <confirmation_modal ref="confirmationModal"></confirmation_modal>
    <link_accessory_order_search_modal @selected="onSelected"  :car_code_id="carCodeId" v-if="carCodeId.length > 0 "></link_accessory_order_search_modal>
  </div>
</template>
<script>
import mixinLayoutComponents from '@/mixins/layout_components';
import agListController from '@/mixins/ag-list-controller';
import _ from 'lodash';
import datasource from '@/mixins/datasource';
import acl from '@/mixins/acl';
import confirmation_modal from '@/components/modals/confirmation-modal';
import mixinFormController from '@/mixins/form_controller';
import link_accessory_order_search_modal from '@/components/modals/link-accessory-order-search-modal';
import { fields } from '../../../../api/rules/fields_link_accessory_order';
import constants from '../../../../api/rules/constants';

export default {
  name: 'link_accessory_order-list',
  data() {
    return {
      name: 'LinkAccessoryCarList',
      api_name: 'link_accessory_order',
      detail_page: 'link_accessory_order-form',
      delete_disabled: true,
    };
  },
  routes: [
    {
      path: '/link_accessory_order-list',
      name: 'link_accessory_order-list',
      meta: { requiresAuth: true },
    },
  ],
  mixins: [mixinLayoutComponents, agListController, datasource, acl, mixinFormController],
  computed: {
    carCodeId() { return this.car_code_id || ''; },
    orderId() { return this.order_id; },
    fieldList() {
      return fields;
    },
    tabFieldList() {
      const r = [
        _.extend(fields.category, {}),
        _.extend(fields.name, {}),
        _.extend(fields.color, {}),
        _.extend(fields.notes, {}),
      ];
      return r;
    },
    deleteDisabled: {
      get() {
        return this.delete_disabled || this.checkACL(this.userAclAction.DELETE, this.aclRules.DATA_PAGES) === false;
      },
      set(v) {
        this.delete_disabled = v;
      },
    },

  },
  components: { confirmation_modal, link_accessory_order_search_modal },
  methods: {
    onSelected(e) {
      const changes = {
        accessory_code_id: e.code_id,
        order_id: this.orderId,
      };
      this.commonSaveRecord(changes, { force_seq_id: constants.IDS.ADD_NEW_RECORD_ID }, (err, _result) => {
        this.gridOptions.api.purgeInfiniteCache();
        this.countRows('subPageLinkAccessoryCar');
        this.$notify({ clean: true });
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            this.$notify({ type: 'Info', title: 'Already exist', text: 'The record already exist' });
          } else {
            this.$notify({ type: 'error', title: 'Error', text: err });
          }
        } else {
          this.$notify({ type: 'success', title: 'Added', text: 'Success' });
        }
      });
    },

    onAddNew() {
      return this.$router.push({
        name: this.detail_page,
        params: { seq_id: 'new' },
      });
    },
    createColumnDefs() {
      return this.commonCreateColumnDefs({ show_details: false, show_checkbox: false });
    },
    onDetailsClick(_ev, data) {
      console.log('onDetailsClick', { data });
      return this.$router.push({
        name: this.detail_page,
        params: { seq_id: data.seq_id },
      });
    },
    onArraySelected(_ev, data) {
      console.log('onArraySelected', { _ev, data });
      this.deleteDisabled = Array.isArray(this.selectedRowArr) ? this.selectedRowArr.length < 1 : true;
    },
    onDeleteSelected() {
      this.$refs.confirmationModal.showModal({
        title: 'Delete',
        text: 'Are you sure you want to delete it?',
        ok_text: 'Delete',
        cancel_text: 'Cancel',
        ok_class: 'btn-danger',
        cancel_class: 'btn-primary',
        on_confirm: (answer) => {
          console.log('on_confirm', { answer });
          if (answer === 'yes') {
            console.log('onDeleteSelected');
            this.commonDeleteSelected((err) => {
              if (err) {
                this.$notify({
                  type: 'error',
                  title: 'Error',
                  text: err,
                });
              } else {
                this.$notify({
                  type: 'success',
                  title: 'Deleted',
                  text: 'Success',
                });
              }
            });
          }
        },
      });
    },
  },
  props: ['order_id', 'car_code_id'],
  beforeCreate() {
  },
  created() {
  },
  beforeMount() {
    this.gridOptions = _.extend(this.commonGridOptions, {});
    this.api_request_options = { order_id: this.orderId };
    this.initDatasource({});
  },
  mounted() {
    this.gridOptions.api.sizeColumnsToFit();
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
<style scoped></style>
