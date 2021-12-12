<template>
  <div class="row" style="margin-bottom:5px;padding: 0px 5px;">
    <field-label :field_info="fieldInfo"></field-label>

    <div class="col-8" >
      <div v-if="fieldInfo.type == types.INPUT">
        <input-box
          :field-info="fieldInfo"
          :value="valinfo"
          :option="optionInfo"
          :read="readOnly"
          @error_msg="onErrorMsg"
          @on_update="onUpdate"
        ></input-box>
      </div>
      <div v-else-if="fieldInfo.type == types.SELECT_BOX">
        <select-box 
          @on_update="onUpdate"
          :field-info="fieldInfo" :value="valinfo" :option="optionInfo" :read="readOnly"></select-box>
      </div>
      <div v-else-if="fieldInfo.type == types.DATE_PICKER  || fieldInfo.type == types.CURRENT_TIME || fieldInfo.type == types.DATETIME_PICKER">
        <date-box :field-info="fieldInfo" :value="valinfo" :option="optionInfo" :read="readOnly"></date-box>
      </div>
      <div v-else-if="fieldInfo.type == types.PASSWORD">
        <password-box :field-info="fieldInfo" :value="valinfo" :option="optionInfo" :read="readOnly"></password-box>
      </div>
      <div v-else-if="fieldInfo.type == types.RADIO_BUTTON">
        <radio-button :field-info="fieldInfo" :value="valinfo" :option="optionInfo" :read="readOnly"></radio-button>
      </div>
      <div v-else-if="fieldInfo.type == types.TEXT_AREA">
        <text-area :field-info="fieldInfo" :value="valinfo" :option="optionInfo" :read="readOnly"></text-area>
      </div>
      <div v-else-if="fieldInfo.type == types.CHECKBOX">
        <check-box :field-info="fieldInfo" :value="valinfo" :option="optionInfo" :read="readOnly"></check-box>
      </div>
      <div v-else-if="fieldInfo.type == types.SPACE">
        <div class="form-group e_form_group">
          <br />
        </div>
      </div>
    </div>
    <field-footer :field_footer_label="'Error for '+ fieldInfo.label"></field-footer>


  </div>
</template>

<script>

import inputBox from "@/components/fields/input";
import passwordBox from "@/components/fields/password";
import selectBox from "@/components/fields/select";
import radioBox from "@/components/fields/radio";
import dateBox from "@/components/fields/date-time";
import textArea from "@/components/fields/text-area";
import checkBox from "@/components/fields/check-box";

import fieldLabel from "@/components/fields/parts/field-label";
import fieldFooter from "@/components/fields/parts/field-footer";
import constants from '../../../api/rules/constants';


import debug from "debug";
var debug_form_field = debug("__e:form-field");

export default {
  components: {
    "input-box": inputBox,
    "password-box": passwordBox,
    "select-box": selectBox,
    "radio-button": radioBox,
    "date-box": dateBox,
    "text-area": textArea,
    "check-box": checkBox,
    "field-footer":fieldFooter,
    "field-label":fieldLabel
  },
  data() {
    return {
      //  testVal:"..."
      error_msg: "",
      show_error: false,
      show_error_mode: "none"
    };
  },
  computed: {
    styleForError() {},
    errorMode: {
      get() {
        return this.show_error_mode;
      },
      set(v) {
        this.show_error_mode = v;
      }
    },
    errorMsg: {
      get() {
        return this.error_msg;
      },
      set(v) {
        this.error_msg = v;
      }
    },
    showError: {
      get() {
        return this.show_error;
      },
      set(v) {
        this.show_error = v;
      }
    },
    types() {
      return constants.TYPES;
    },
    fieldInfo() {
      var ret = this.$props.field_info;
      debug_form_field("fieldInfo.type", ret.type, ret);
      console.log('TEST DEBUG 211128 (110 at form-field.vue)[17:48]: ', { type:ret.type, ret });
      return ret;
    },
    optionInfo() {
      debug_form_field(
        "this.props.option",
        this.$props.field_info.id,
        JSON.stringify(this.$props.option)
      );
      return this.$props.option;
    },
    valinfo() {
      if (
        typeof this.$props.val == "undefined" ||
        this.$props.val == null ||
        this.$props.val.length == 0
      ) {
        // debug_form_field("empty value",this.$props.val, this.$props.field_info.type)
        return " ";
      } else {
        return this.$props.val;
      }
    },
    readOnly() {
      return this.$props.read || this.$props.field_info.read_only == true;
    }
  },
  methods: {
    onUpdate(o){
      this.$emit("on_update",o);
    },
    onErrorMsg(err_obj) {
      this.errorMsg = err_obj.msg;
      this.showError = err_obj.msg && err_obj.msg.length > 0;
      this.errorMode = err_obj.error_mode;
      if (err_obj.error_mode == "warning") {
        this.$emit("validationRestriction", {
          active: false,
          id: this.fieldInfo.id
        });
      } else if (err_obj.error_mode == "restrict") {
        var ative = false;
        if (err_obj.msg && err_obj.msg.length > 0) {
          ative = true;
        }
        this.$emit("validationRestriction", {
          active: ative,
          id: this.fieldInfo.id
        });
      }
      console.log(
        "this.errorMode",
        err_obj.error_mode,
        this.errorMode,
        err_obj
      );
    },
    fakeDate() {
      return Vue.localStorage.get("fakeDate") || false;
    }
  },
  mounted() {},
  props: {
    read: { default: true },
    field_info: { default: {} },
    val: { default: "" },
    option: {
      type: Object,
      default: () => {
        return {};
      }
    }
  }
};

</script>
<style>

.e_form_label {
  background-color: #b4d5f1 !important;
  margin: 2px 0px !important;
  padding: 4px !important;
  font-size: 11px !important;
  text-align: center !important;
}

.e_form_group {
  padding: 0px !important;
  margin: 0px !important;
}
.form-control {
  _height: 24px !important;
}
.vdp-datepicker__calendar-button,
.vdp-datepicker__clear-button {
  padding: 0px 12px !important;
}
.vdp-datepicker {
  width: 100% !important;
}
</style>
