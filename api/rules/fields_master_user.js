const { TYPES, SELECT_FIELD_MODE } = require('./constants');

const arr = [
  { id: 'seq_id', label: 'Unique Key', type: TYPES.INPUT },

  // {
  //   id: "approval_status",
  //   label: "承認状態",
  //   type: TYPES.SELECT_BOX,
  //   options: [
  //     "承認済", // Approved
  //     "申請中", // Applying
  //     "下書中", // In draft
  //     "差戻",
  //   ],
  // },
  {
    id: 'user_id',
    label: 'ユーザID',
    type: TYPES.INPUT,
    error_if_blank: true,
    export: {
      enabled: true,
      sequence: 1000,
      master_user: 'B',
    },
  },
  {
    id: 'user_shimei',
    label: 'ユーザ氏名（ﾌﾙﾈｰﾑ）',
    type: TYPES.INPUT,
    error_if_blank: true,
    export: {
      enabled: true,
      sequence: 1000,
      master_user: 'C',
    },
  },
  // {
  //   id: "role",
  //   label: "役割",
  //   type: TYPES.SELECT_BOX,
  //   error_if_blank:true,
  //   options: [
  //     "ユーザIDオペレーション担当者",  // User ID Operations Personnel // Yūza ID operēshon tantōsha
  //     "管理担当者",                 // Administrator          //Kanri tantōsha
  //     "管理責任者",                 // Chief administrator    // Kanri sekininsha
  //     "システム管理者",              // System Administrator   //Shisutemu kanrisha
  //     "保守担当"                    // Maintenance staff      // Hoshu tantō
  //   ],

  //   export: {
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "D"
  //   },
  // },
  // {
  //   id: "company",
  //   label: "所属会社", // Shozoku kaisha
  //   type: TYPES.SELECT_BOX4,
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
  //   type: TYPES.SELECT_BOX4,
  //   search_mode_type_ahead:true,
  //   sort_result:true,
  //   error_if_blank:true,
  //   api_uniq_grouping:true,
  //   api:"/master_belongs/list_department_for_user_control",
  //   api_field_name:"department",
  //   page_controller:true,
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
  //   type: TYPES.SELECT_BOX4,
  //   search_mode_type_ahead:true,
  //   sort_result:true,
  //   api_uniq_grouping:true,
  //   error_if_blank:true,
  //   page_controller:true,
  //   api: "/master_belongs/list_department_for_user_control",
  //   api_field_name:"team",
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
    id: 'test1',
    label: 'Test1',
    options_mode: SELECT_FIELD_MODE.ARRAY,
    array: ['opt1', 'opt2', 'opt3'],
    type: TYPES.SELECT_BOX,
  },
  {
    id: 'test2',
    label: 'Test2',
    options_mode: SELECT_FIELD_MODE.LIST,
    list: [
      { label: 'O 1', value: 'opt1' },
      { label: 'O 2', value: 'opt2' },
      { label: 'O 3', value: 'opt3' },
      { label: 'O 4', value: 'opt4' },
    ],
    type: TYPES.SELECT_BOX,
  },
  {
    id: 'test3',
    label: 'Test3',
    options_mode: SELECT_FIELD_MODE.API,
    api: {
      url: '/test/get_options',
      label: 'name',
      value: 'id',
      filter: {
        remote_field: 'test2',
        remote_watch: true,
        remote_watch_firs_load_delay: 0,
        remote_filed_filter_field: 'group',
        local_api_filter: 'value',
      },
    },
    type: TYPES.SELECT_BOX,
  },
  {
    id: 'login_failure_count',
    label: 'ログイン失敗回数',
    type: TYPES.INPUT,
  },
  {
    id: 'password',
    label: 'パスワード',
    type: TYPES.PASSWORD,
    error_if_blank: true,
  },
  // {
  //   id: "mail_address",
  //   label: "メールアドレス",
  //   type: TYPES.EMAIL,
  //   error_if_blank:true,
  //   options: ["@mizuhofg.co.jp","@mizuho-bk.co.jp","@mizuhotb.co.jp"],
  // },
  {
    id: 'my_date1',
    label: 'My Date',
    type: TYPES.DATE_PICKER,
    show_time: false,
    format: 'YYYY/MM/DD',
  },
  {
    id: 'my_date2',
    label: 'My Date Time',
    type: TYPES.DATE_PICKER,
    show_time: true,
    format: 'YYYY/MM/DD HH:mm',
  },
  // {
  //   id: "last_password_changed_date",
  //   label: "パスワード最終更新日",
  //   type: TYPES.DATE_PICKER,
  //   disabled:true,
  //   read_only:true
  // },
  // {
  //   id: "status",
  //   label: "アクセス状態",
  //   type: TYPES.SELECT_BOX2,
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
  //   type: TYPES.CHECKBOX,
  //   global_emit:"authority_1_selected",
  // },
  // {
  //   id: "role_1",
  //   label: "役割",
  //   type: TYPES.SELECT_BOX,
  //   error_if_blank:true,
  //   options: [
  //     "ユーザIDオペレーション担当者",  // User ID Operations Personnel
  //     "管理担当者",                 // Administrator
  //     "管理責任者",                 // Chief administrator
  //     "システム管理者",              // System Administrator
  //     "保守担当"                    // Maintenance staff
  //   ],
  //   export: {
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "D"
  //   },
  // },
  // {
  //   id: "company_1",
  //   label: "所属会社",
  //   type: TYPES.SELECT_BOX4,
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
  //   type: TYPES.SELECT_BOX4,
  //   page_controller:true,
  //   sort_result:true,
  //   error_if_blank:true,
  //   api:"/master_belongs/list_department_for_user_control",
  //   api_field_name:"department",
  //   export: {
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "F"
  //   },
  // },
  // {
  //   id: "team_1",
  //   label: "所属チーム名",
  //   type: TYPES.SELECT_BOX4,
  //   sort_result:true,
  //   error_if_blank:true,
  //   api: "/master_belongs/list_department_for_user_control",
  //   api_field_name:"team",
  //   page_controller:true,
  //   export: {
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "G"
  //   },
  // },
  // {
  //   id: "authority_2",
  //   label: "兼務設定【２】",
  //   type: TYPES.CHECKBOX,
  //   global_emit:"authority_2_selected",
  // },
  // {
  //   id: "role_2",
  //   label: "役割",
  //   type: TYPES.SELECT_BOX,
  //   error_if_blank:true,
  //   options: [
  //     "ユーザIDオペレーション担当者",  // User ID Operations Personnel
  //     "管理担当者",                 // Administrator
  //     "管理責任者",                 // Chief administrator
  //     "システム管理者",              // System Administrator
  //     "保守担当"                    // Maintenance staff
  //   ],
  //   export: {
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "D"
  //   },
  // },
  // {
  //   id: "company_2",
  //   label: "所属会社",
  //   type: TYPES.SELECT_BOX4,
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
  //   type: TYPES.SELECT_BOX4,
  //   page_controller:true,
  //   sort_result:true,
  //   error_if_blank:true,
  //   api:"/master_belongs/list_department_for_user_control",
  //   api_field_name:"department",
  //   export: {
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "F"
  //   },
  // },
  // {
  //   id: "team_2",
  //   label: "所属チーム名",
  //   type: TYPES.SELECT_BOX4,
  //   error_if_blank:true,
  //   sort_result:true,
  //   api: "/master_belongs/list_department_for_user_control",
  //   api_field_name:"team",
  //   page_controller:true,
  //   export: {
  //     enabled: true,
  //     sequence: 1000,
  //     master_user: "G"
  //   },
  // },
  // {
  //   id: "has_multiple",
  //   label: "has_multiple",
  //   type: TYPES.INPUT,
  // },
  // {
  //   id: "more_details",
  //   label: "詳細",
  //   type: TYPES.INPUT,
  // },
  // {
  //   id: "button_options",
  //   history_label_name: "hide",
  //   label: "ﾁｪｯｸ",
  //   type: TYPES.INPUT,
  // },
];
const ret = {};
let s = 1;
arr.forEach((e) => {
  /* eslint-disable no-alert, no-console */
  const ex_pattern = '^[a-z][a-z0-9_]+$';
  if (!RegExp(ex_pattern).test(e.id)) { alert(`Invalid field ${e.id}`); }
  e.tab_label = e.tab_label || e.label;
  e.seq_id = s;
  s += 1;
  ret[e.id] = e;
  /* eslint-enable no-alert, no-console */
});
ret.array = arr;
module.exports.fields = ret;
module.exports.filed_types = TYPES;
