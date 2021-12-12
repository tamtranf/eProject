

let types = require('./constants').TYPES;

let arr = [
  { id: "seq_id", label: "Unique Key", type: types.INPUT },

  // {
  //   id: "approval_status",
  //   label: "承認状態",
  //   type: types.SELECT_BOX,
  //   options: [
  //     "承認済", // Approved
  //     "申請中", // Applying
  //     "下書中", // In draft
  //     "差戻",
  //   ],
  //   import: { enabled: false },
  // },
  {
    id: "user_id",
    label: "ユーザID",
    type: types.INPUT,
    error_if_blank:true,
    import: { enabled: true },
    export: { 
      enabled: true,
      sequence: 1000,
      master_user: "B"
    },
  },
  {
    id: "user_shimei",
    label: "ユーザ氏名（ﾌﾙﾈｰﾑ）",
    type: types.INPUT,
    error_if_blank:true,
    import: { enabled: true },
    export: { 
      enabled: true,
      sequence: 1000,
      master_user: "C"
    },
  },
  // {
  //   id: "role",
  //   label: "役割",
  //   type: types.SELECT_BOX,
  //   error_if_blank:true,
  //   options: [
  //     "ユーザIDオペレーション担当者",  // User ID Operations Personnel // Yūza ID operēshon tantōsha
  //     "管理担当者",                 // Administrator          //Kanri tantōsha
  //     "管理責任者",                 // Chief administrator    // Kanri sekininsha
  //     "システム管理者",              // System Administrator   //Shisutemu kanrisha
  //     "保守担当"                    // Maintenance staff      // Hoshu tantō
  //   ],

  //   import: { enabled: true },
  //   export: { 
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "D"
  //   },
  // },
  // {
  //   id: "company",
  //   label: "所属会社", // Shozoku kaisha
  //   type: types.SELECT_BOX4,
  //   search_limit_no_admin_company_from_local_storage:true,
  //   error_if_blank:true,
  //   page_controller:true,
  //   api:"/master_belongs/list_department_for_user_control",
  //   api_field_name:"company",
  //   api_uniq_grouping:true,
  //   emit_input:true,
  //   export: {
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "E"
  //   },
  //   search_dependency:{
  //     algorithm:"company",
  //     fields:{
  //       company: {field:"company",api:"company"},
  //       department:{field:"department",api:"department"},
  //       team:{field:"team",api:"team"}
  //     },
  //     clear_on_reset:["department","team"]
  //   }
  // },
  // {
  //   id: "department",
  //   label: "所属部署名", // Shozoku-bu shomei
  //   type: types.SELECT_BOX4,
  //   search_mode_type_ahead:true,
  //   sort_result:true,
  //   error_if_blank:true,
  //   api_uniq_grouping:true,
  //   api:"/master_belongs/list_department_for_user_control",
  //   api_field_name:"department",
  //   page_controller:true,
  //   import: { enabled: true },
  //   export: {
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "F"
  //   },
  //   search_dependency:{
  //     algorithm:"company",
  //     fields:{
  //       company: {field:"company",api:"company"},
  //       department:{field:"department",api:"department"},
  //       team:{field:"team",api:"team"}
  //     },
  //     clear_on_reset:["team"]
  //   }
  // },
  // {
  //   id: "team",
  //   label: "所属チーム名",
  //   type: types.SELECT_BOX4,
  //   search_mode_type_ahead:true,
  //   sort_result:true,
  //   api_uniq_grouping:true,
  //   error_if_blank:true,
  //   page_controller:true,
  //   api: "/master_belongs/list_department_for_user_control",
  //   api_field_name:"team",
  //   import: { enabled: true },
  //   export: {
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "G"
  //   },
  //   search_dependency:{
  //     algorithm:"company",
  //     fields:{
  //       company: {field:"company",api:"company"},
  //       department:{field:"department",api:"department"},
  //       team:{field:"team",api:"team"}
  //     },
  //     clear_on_reset:[]
  //   }
  // },
  {
    id: "login_failure_count",
    label: "ログイン失敗回数",
    type: types.INPUT,
    import: { enabled: true },
  },
  // {
  //   id: "password",
  //   label: "パスワード",
  //   type: types.PASSWORD,
  //   error_if_blank:true,
  //   import: { enabled: false },
  // },
  // {
  //   id: "mail_address",
  //   label: "メールアドレス",
  //   type: types.EMAIL,
  //   error_if_blank:true,
  //   options: ["@mizuhofg.co.jp","@mizuho-bk.co.jp","@mizuhotb.co.jp"],
  //   import: { enabled: true },
  // },
  // {
  //   id: "last_login_date",
  //   label: "最終ログイン日時",
  //   type: types.DATETIME_PICKER,
  //   import: { enabled: false },
  // },
  // {
  //   id: "last_password_changed_date",
  //   label: "パスワード最終更新日",
  //   type: types.DATE_PICKER,
  //   disabled:true,
  //   read_only:true
  // },
  // {
  //   id: "status",
  //   label: "アクセス状態",
  //   type: types.SELECT_BOX2,
  //   error_if_blank:true,
  //   options: [
  //     {value:1,label:"有効"},
  //     {value:9,label:"無効"}
  //   ],
  //   table_field_style:{
  //     1:"",
  //     9:"color:red;"
  //   },
  //   export: { 
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "A"
  //   },
  // },
  // {
  //   id: "authority_1",
  //   label: "兼務設定【１】",
  //   type: types.CHECKBOX,
  //   global_emit:"authority_1_selected",
  //   import: { enabled: false },
  // },
  // {
  //   id: "role_1",
  //   label: "役割",
  //   type: types.SELECT_BOX,
  //   error_if_blank:true,
  //   options: [
  //     "ユーザIDオペレーション担当者",  // User ID Operations Personnel
  //     "管理担当者",                 // Administrator
  //     "管理責任者",                 // Chief administrator
  //     "システム管理者",              // System Administrator
  //     "保守担当"                    // Maintenance staff
  //   ],
  //   import: { enabled: true },
  //   export: { 
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "D"
  //   },
  // },
  // {
  //   id: "company_1",
  //   label: "所属会社",
  //   type: types.SELECT_BOX4,
  //   error_if_blank:true,
  //   api:"/master_company/list_company_name_for_user_control",
  //   emit_input:true,
  //   page_controller:true,
  //   export: { 
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "E"
  //   },
  // },
  // {
  //   id: "department_1",
  //   label: "所属部署名",
  //   type: types.SELECT_BOX4,
  //   page_controller:true,
  //   sort_result:true,
  //   error_if_blank:true,
  //   api:"/master_belongs/list_department_for_user_control",
  //   api_field_name:"department",
  //   import: { enabled: true },
  //   export: { 
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "F"
  //   },
  // },
  // {
  //   id: "team_1",
  //   label: "所属チーム名",
  //   type: types.SELECT_BOX4,
  //   sort_result:true,
  //   error_if_blank:true,
  //   api: "/master_belongs/list_department_for_user_control",
  //   api_field_name:"team",
  //   page_controller:true,
  //   import: { enabled: true },
  //   export: { 
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "G"
  //   },
  // },
  // {
  //   id: "authority_2",
  //   label: "兼務設定【２】",
  //   type: types.CHECKBOX,
  //   global_emit:"authority_2_selected",
  //   import: { enabled: false },
  // },
  // {
  //   id: "role_2",
  //   label: "役割",
  //   type: types.SELECT_BOX,
  //   error_if_blank:true,
  //   options: [
  //     "ユーザIDオペレーション担当者",  // User ID Operations Personnel
  //     "管理担当者",                 // Administrator
  //     "管理責任者",                 // Chief administrator
  //     "システム管理者",              // System Administrator
  //     "保守担当"                    // Maintenance staff
  //   ],
  //   import: { enabled: true },
  //   export: {
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "D"
  //   },
  // },
  // {
  //   id: "company_2",
  //   label: "所属会社",
  //   type: types.SELECT_BOX4,
  //   error_if_blank:true,
  //   page_controller:true,
  //   api:"/master_company/list_company_name_for_user_control",
  //   emit_input:true,
  //   export: {
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "E"
  //   },
  // },
  // {
  //   id: "department_2",
  //   label: "所属部署名",
  //   type: types.SELECT_BOX4,
  //   page_controller:true,
  //   sort_result:true,
  //   error_if_blank:true,
  //   api:"/master_belongs/list_department_for_user_control",
  //   api_field_name:"department",
  //   import: { enabled: true },
  //   export: {
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "F"
  //   },
  // },
  // {
  //   id: "team_2",
  //   label: "所属チーム名",
  //   type: types.SELECT_BOX4,
  //   error_if_blank:true,
  //   sort_result:true,
  //   api: "/master_belongs/list_department_for_user_control",
  //   api_field_name:"team",
  //   page_controller:true,
  //   import: { enabled: true },
  //   export: { 
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "G"
  //   },
  // },
  // {
  //   id: "has_multiple",
  //   label: "has_multiple",
  //   type: types.INPUT,
  // },
  // {
  //   id: "more_details",
  //   label: "詳細",
  //   type: types.INPUT,
  // },
  // {
  //   id: "button_options",
  //   history_label_name: "hide",
  //   label: "ﾁｪｯｸ",
  //   type: types.INPUT,
  // },
];
var ret = {};
var s = 1;
arr.forEach(function (e) {
  if(!RegExp("^[a-z][a-z0-9_]+$").test(e.id)){alert("Invalid field " + e.id);};
  e["tab_label"] = e.tab_label || e.label;
  e["seq_id"] = s++;
  ret[e.id] = e;
});
ret.array = arr;
module.exports.fields = ret;
module.exports.filed_types = types;
