import debug from 'debug';
import _ from 'lodash';

const debug_pageDatasource = debug('e:datasource');

export default {
  components: {},
  created() {},
  data() {
    return {
      search_sequence: Math.random() + 10,
      pageDataSource: null,
      state: false,
      last_data_source_sort_key: '',
      last_data_source_sort: false,
      last_data_source_filter_key: '',
      last_data_source_filter: false,
      search_timer: false,
      select_on_load: false,
      select_on_load_position: 0,
      grid_option: false,
      get_rows_count: 0,
      load_only_with_filter: false,
      init_data_source_options: {},
    };
  },
  computed: {
    gridOptions: {
      get() {
        return this.grid_option;
      },
      set(v) {
        this.grid_option = v;
      },
    },
  },
  methods: {
    beforeRouteLeaveFlag() {
      return true;
    },

    beforeRouteLeaveDialog() {
      return true;
    },

    get_def(val, def = '') {
      if (typeof val === 'undefined' || val === null || val === false || val === '') {
        return def;
      }
      return val;
    },

    clearSelectionsDatasource() {
      if (!this.gridOptions.api) {
        return;
      }
      this.gridOptions.api.forEachNode((node) => {
        if (typeof node !== 'undefined' && typeof node.data !== 'undefined') {
          if (typeof node.data.is_selected !== 'undefined') {
            if (node.data.is_selected === true) {
              node.data.is_selected = false;
            }
          }
        }
      });
      this.formOutputQty = 0;
      this.selectAllIcon = 'unchecked';
      this.isAllSelected = false;
      this.selectedRowArr = [];
      this.gridOptions.api.redrawRows();
    },
    cancelCurrentSelection() {
    },
    searchByListDatasource(filter) {
      const filter_key = `${this.get_def(filter.by_list)}_${this.get_def(filter.filter_by)}_${this.get_def(filter.list)}`;
      debug_pageDatasource('searchByOneDatasource', filter, filter_key);

      if (filter_key === this.last_data_source_filter_key) {
        return;
      }
      this.last_data_source_filter_key = filter_key;

      this.last_data_source_filter = filter;

      if (this.clearSelectionsDatasource) {
        this.clearSelectionsDatasource();
      }
      this.cancelCurrentSelection(true);
      if (!this.state.gridOptions.api) {
        return;
      }
      const filterComponent = this.state.gridOptions.api.getFilterInstance('search_flow_control');
      filterComponent.getModel();
      filterComponent.setModel({
        type: 'contains',
        filter: new Date().getTime(),
      });
      this.state.gridOptions.api.onFilterChanged();
      this.state.gridOptions.api.setDatasource(this.pageDataSource);
      this.state.countRows('searchByListDatasource');
    },

    searchByOneDatasource(filter) {
      const filter_key = `${this.get_def(filter.by_one)}_${this.get_def(filter.filter_by)}_${this.get_def(filter.one_value)}`;
      debug_pageDatasource('searchByOneDatasource', filter, filter_key);

      if (filter_key === this.last_data_source_filter_key) {
        return;
      }
      this.last_data_source_filter_key = filter_key;

      this.last_data_source_filter = filter;

      if (this.clearSelectionsDatasource) {
        this.clearSelectionsDatasource();
      }
      this.cancelCurrentSelection(true);
      if (!this.state.gridOptions.api) {
        return;
      }
      const filterComponent = this.state.gridOptions.api.getFilterInstance('search_flow_control');
      filterComponent.getModel();
      filterComponent.setModel({
        type: 'contains',
        filter: new Date().getTime(),
      });
      this.state.gridOptions.api.onFilterChanged();
      this.state.gridOptions.api.setDatasource(this.pageDataSource);
      this.state.countRows('searchByOneDatasource');
    },

    onSelectedClickDatasource(ev, selected_row) {
      debug_pageDatasource('on_SelectedClick', selected_row);
      // if(this.hideCheckBox){
      //   if(this.hideCheckBox(selected_row) === true){
      //     return ""
      //   }
      // }
      let set_as_selected = 3;
      let select_action = 'NA';
      this.gridOptions.api.forEachNode((node) => {
        if (typeof node !== 'undefined' && typeof node.data !== 'undefined') {
          if (typeof node.data.seq_id !== 'undefined') {
            if (node.data.seq_id === selected_row.seq_id) {
              const row_was_selected = _.find(this.selectedRowArr, (d) => d.seq_id === selected_row.seq_id && set_as_selected === 3);
              const in_arr = _.find(this.selectedRowArr, (d) => d.seq_id === selected_row.seq_id);
              if (row_was_selected || set_as_selected === -1) {
                if (set_as_selected === 3) {
                  set_as_selected = -1;
                }
                node.data.is_selected = false;
                select_action = 'uncheck';
                _.remove(this.selectedRowArr, (d) => d.seq_id === selected_row.seq_id);
              } else {
                if (set_as_selected === 3) {
                  set_as_selected = 1;
                }
                if (!in_arr) {
                  select_action = 'check';
                  this.selectedRowArr.push(selected_row);
                }
                node.data.is_selected = true;
              }
            }
          }
        }
      });
      this.gridOptions.api.redrawRows();

      this.formOutputQty = this.selectedRowArr.length;
      if (this.selectedRowArr.length === 0) {
        this.selectAllIcon = 'unchecked';
        this.isAllSelected = false;
      } else {
        this.selectAllIcon = 'many';
        this.isAllSelected = false;
      }
      if (typeof this.onArraySelected !== 'undefined') {
        this.onArraySelected(ev, { row: selected_row, select_action });
      }
    },

    onReprocessIsSelectedClickDatasource(_ev) {
      this.selectedRowArr = [];
      this.formOutputQty = 0;
      this.gridOptions.api.forEachNode((node) => {
        if (typeof node !== 'undefined' && typeof node.data !== 'undefined') {
          if (typeof node.data.seq_id !== 'undefined') {
            if (node.data.is_selected === true) {
              this.selectedRowArr.push(node.data);
            }
          }
        }
      });
      this.gridOptions.api.redrawRows();
      this.formOutputQty = this.selectedRowArr.length;
      if (this.selectedRowArr.length === 0) {
        this.selectAllIcon = 'unchecked';
        this.isAllSelected = false;
      } else {
        this.selectAllIcon = 'many';
        this.isAllSelected = false;
      }
    },

    emulateSearchControlChangedDatasource(force_clear = false) {
      if (this.last_data_source_filter && force_clear === false) {
        this.searchControlChangedDatasource(this.last_data_source_filter);
      } else {
        this.search_sequence += 1;
        this.searchControlChangedDatasource(this.singleSearchCreate(`emulate_search_${this.search_sequence}`, ' '));
      }
    },

    searchControlChangedDatasource(f) {
      console.log('search ControlChangedDatasource IN ', { f });
      if (f.is_block_info !== true) {
        console.log('search ControlChangedDatasource IGNORING ', { f });
        return false;
      }
      if (this.load_mode !== 'ds') {
        return this.searchControlChanged(f);
      }
      if (this.clearSelectionsDatasource) {
        this.clearSelectionsDatasource();
      }
      this.cancelCurrentSelection(false);
      /**
       *
       * TODO: Later need to support SELECTED_EMPTY_SELECT_BOX too.
       */

      let cont = false;
      let filter_key = '';
      ['1', '2', '3'].forEach((fi) => {
        const v = this.get_def(f[fi].value);
        const ca = this.get_def(f[fi].ca, false);
        const ct = this.get_def(f[fi].ct);
        if (v.length > 0 || ca === true || ct === 'v') {
          cont = true;
        }
        filter_key += `${v}_`;
      });
      filter_key += `${this.get_def(f.b2_disabled)}_${this.get_def(f.b3_disabled)}_${this.get_def(f.j1)}_${this.get_def(f.j2)}`;
      debug_pageDatasource('search ControlChangedDatasource', f, filter_key);
      if (this.search_timer) {
        clearTimeout(this.search_timer);
      }
      this.search_timer = setTimeout(() => {
        debug_pageDatasource('search ControlChangedDatasource checking', {
          f,
          filter_key,
          cont,
        });
        if (filter_key !== this.last_data_source_filter_key && cont === true) {
          debug_pageDatasource('search ControlChangedDatasource PROCESSING', f, filter_key);
          this.last_data_source_filter = f;
          if (!this.state.gridOptions.api) {
            return;
          }
          const filterComponent = this.state.gridOptions.api.getFilterInstance('search_flow_control');
          filterComponent.getModel();
          filterComponent.setModel({
            type: 'contains',
            filter: new Date().getTime(),
          });
          this.state.gridOptions.api.onFilterChanged();
          this.state.gridOptions.api.setDatasource(this.pageDataSource);
          this.state.countRows('search ControlChangedDatasource');
        }
      }, 500);
    },

    selectAllDatasource() {
      debug_pageDatasource('select_AllDatasource');
      const rows_limit = 1000;
      const current_lines = this.gridOptions.api.getInfiniteRowCount();
      if (current_lines > rows_limit) {
        // console.log("select_AllDatasource Can not select more then "+rows_limit+" at each time")
        // bus.$emit('showInformationModal', {
        //   message:
        //     `毎回${rows_limit}行以上を選択することはできません。現在は${current_lines} 行あります。<br>フィルターを使用して削減します。`,
        // });
        return;
      }
      if (this.isAllSelected === true) {
        // debug_pageDatasource("select_AllDatasource clear and return")
        return this.clearSelectionsDatasource();
      }
      // debug_pageDatasource("select_AllDatasource clear and continue")
      this.clearSelectionsDatasource();
      this.state.gridOptions.api.showLoadingOverlay();
      this.state.$ajax.post(`/${this.api_name}/datasource_load_for_select_all/`, { filter: this.last_data_source_filter }, (err, result) => {
        this.state.gridOptions.api.hideOverlay();
        result.forEach((selected_row) => {
          this.selectedRowArr.push(selected_row);
        });

        this.gridOptions.api.forEachNode((node) => {
          node.data.is_selected = true;
        });
        this.gridOptions.api.redrawRows();
        this.selectAllIcon = 'checked';
        this.isAllSelected = true;
        this.formOutputQty = this.selectedRowArr.length;
      });
    },

    refreshNewRowDatasource(result, mode) {
      const { seq_id } = result;
      this.countRows('refreshNewRowDatasource');

      const obj = {};
      if (this.last_data_source_filter) {
        obj.filter = this.last_data_source_filter;
      }
      if (this.last_data_source_sort) {
        obj.sort = this.last_data_source_sort;
      }

      this.$ajax.post(`/${mode}/datasource_position/${seq_id}`, obj, (err, result2) => {
        this.select_on_load = seq_id;
        this.select_on_load_position = result2.data;
        this.gridOptions.api.ensureIndexVisible(result2.data);
        this.gridOptions.api.purgeInfiniteCache();
      });
    },

    setAsZeroRows() {
      const result = 0;
      if (this.gridOptions.api) {
        this.gridOptions.api.setRowCount(parseInt(result), true);
      } else if (this.state.gridOptions.api) {
        this.state.gridOptions.api.setRowCount(parseInt(result), true);
      }
      this.totalNumberOfRows = result;
    },
    setManualCountRows(n, force_count = false) {
      if (n > 100 || force_count > 0) {
        // if there is more then 100 rows, then need to query again.
        return this.state.countRows('set_ManualCountRows 2', { ignore_count_from_result: true });
      }
      const result = n;
      if (this.gridOptions.api) {
        this.gridOptions.api.setRowCount(parseInt(result), true);
      } else if (this.state.gridOptions.api) {
        this.state.gridOptions.api.setRowCount(parseInt(result), true);
      }
      this.totalNumberOfRows = result;
    },

    countRows(requester = '~', options = {}) {
      if (this.count_from_result === true && options.ignore_count_from_result !== true) {
        return 1;
      }
      if (this.load_only_with_filter && (this.last_data_source_filter === false || (this.last_data_source_filter[1]
        && this.last_data_source_filter[1].value === ''))) {
        return this.setAsZeroRows();
      }
      const req_data = { filter: this.last_data_source_filter, requester };

      if (this.api_request_options) {
        req_data.api_request_options = this.api_request_options;
        if (typeof this.api_request_options.sub_search === 'string' && this.api_request_options.sub_search.length > 0) {
          if (typeof this[this.api_request_options.sub_search] !== 'undefined') {
            req_data.sub_search = this[this.api_request_options.sub_search];
          }
        }
      }
      if (this.api_request_options) {
        if (!req_data.api_request_options) {
          req_data.api_request_options = this.api_request_options;
        }
        if (typeof this.api_request_options.filter_mode === 'string' && this.api_request_options.filter_mode.length > 0) {
          if (typeof this[this.api_request_options.filter_mode] !== 'undefined') {
            req_data.filter_mode = this[this.api_request_options.filter_mode];
          }
        }
      }
      this.$ajax.post(`/${this.api_name}/datasource_count/`, req_data, (err, _result) => {
        let result = _result;
        if (err === null) {
          // page12_debug("total rows", result);

          if (typeof result.qty === 'undefined') {
            if (typeof result === 'object' && result.length > 0) {
              const temp = result[0];
              result = temp;
            }
            if (typeof result === 'object') {
              result = result.qty;
            }
          }
          if (this.gridOptions.api) {
            this.gridOptions.api.setRowCount(parseInt(result), true);
            if (result === 0) {
              this.gridOptions.api.showNoRowsOverlay();
            } else {
              this.gridOptions.api.hideOverlay();
            }
          } else if (this.state.gridOptions.api) {
            this.state.gridOptions.api.setRowCount(parseInt(result), true);
            if (result === 0) {
              this.state.gridOptions.api.showNoRowsOverlay();
            } else {
              this.state.gridOptions.api.hideOverlay();
            }
          }
          this.totalNumberOfRows = result;
          if (typeof options !== 'undefined' && typeof options.counted_cb !== 'undefined') {
            options.counted_cb(null, result);
          }
        } else if (typeof options !== 'undefined' && typeof options.counted_cb !== 'undefined') {
          options.counted_cb(err, null);
        }
      });
    },

    initDatasource(options = {}) {
      this.init_data_source_options = options;
      this.load_mode = 'ds';
      this.gridOptions.columnDefs = this.createColumnDefs();
      this.gridOptions.rowModelType = 'infinite';
      // this.gridOptions.enableServerSideSorting = true;
      this.gridOptions.sortingOrder = ['desc', 'asc'];
      this.gridOptions.blockLoadDebounceMillis = 200;
      this.gridOptions.cacheOverflowSize = 100;
      this.gridOptions.cacheBlockSize = 100;
      this.gridOptions.maxBlocksInCache = 10;
      this.gridOptions.overlayNoRowsTemplate = '<span class="ag-overlay-loading-center">対象のデータはありません</span>';
      let initial_count_rows = true;
      this.pageDataSource = {
        state: false,
        setState: (s) => {
          this.state = s; // this
        },
        getRows: (params) => {
          let load_data = true;
          if (this.init_data_source_options.load_only_with_filter === true && (this.last_data_source_filter === false
            || (this.last_data_source_filter[1] && this.last_data_source_filter[1].value === ''))) {
            this.load_only_with_filter = true;
            initial_count_rows = false;
            load_data = false;
          }
          let start = params.startRow;
          if (start < 0) {
            start = 0;
          }

          let end = params.endRow;
          if (end < 0) {
            end = 0;
          }
          if (start === 0 && end === 0) {
            return;
          }
          if (load_data === false) {
            this.gridOptions.datasource = [];
            this.setAsZeroRows();
            return;
          }
          console.log('Sort model', params.sortModel, this.last_data_source_sort);
          if (this.last_data_source_sort && this.last_data_source_sort !== false && this.last_data_source_sort.length > 0) {
            if (params.sortModel && params.sortModel.length === 0) {
              params.sortModel = this.last_data_source_sort;
            }
          }
          const req_data = { filter: this.last_data_source_filter, sort: params.sortModel };
          if (this.api_request_options) {
            req_data.api_request_options = this.api_request_options;
            if (typeof this.api_request_options.sub_search === 'string' && this.api_request_options.sub_search.length > 0) {
              if (typeof this[this.api_request_options.sub_search] !== 'undefined') {
                req_data.sub_search = this[this.api_request_options.sub_search];
              }
            }
          }
          this.state.gridOptions.api.showLoadingOverlay();
          this.state.$ajax.post(`/${this.api_name}/datasource_load/${start}/${end}`, req_data, (err, result) => {
            if (Array.isArray(result) === true && this.count_from_result === true) {
              this.setManualCountRows(result.length, start > 0);
            }
            if (this.state && this.state.gridOptions && this.state.gridOptions.api) {
              this.state.gridOptions.api.hideOverlay();
              if (this.totalNumberOfRows < 1 && (result.length < 1 || Array.isArray(result) === false)) {
                this.state.gridOptions.api.showNoRowsOverlay();
              }
            } else {
              console.log('The this.state.gridOptions.api do not exist., URL:', `/${this.api_name}/datasource_load/${start}/${end}`);
            }
            let data_source_sort_key = '';

            if (params.sortModel) {
              data_source_sort_key = JSON.stringify(params.sortModel);
            }

            if (data_source_sort_key !== this.last_data_source_sort_key) {
              if (this.clearSelectionsDatasource) {
                this.clearSelectionsDatasource();
              }
              this.last_data_source_sort_key = data_source_sort_key;
              this.last_data_source_sort = params.sortModel;
              if (this.count_from_result === true) {
                this.setManualCountRows(result.length, start > 0);
              } else {
                this.state.countRows('initDatasource 1');
              }
            } else if (this.init_data_source_options.force_count_on_load === true) {
              this.last_data_source_sort_key = data_source_sort_key;
              this.last_data_source_sort = params.sortModel;
              if (this.count_from_result === true) {
                this.setManualCountRows(result.length, start > 0);
              } else {
                this.state.countRows('initDatasource 2');
              }
            }
            // this.$store.state[this.stateLastFilterOptions][this.api_name] = {
            //   filter: this.last_data_source_filter,
            //   sort: this.last_data_source_sort,
            //   sort_key: this.last_data_source_sort_key,
            // };
            if (err === null) {
              let select_on_load_found = false;
              result.forEach((d) => {
                d.is_selected = false;
                d.search_control = false;
                d.search_flow_control = false;
                if (this.select_on_load && this.select_on_load === d.seq_id) {
                  select_on_load_found = true;
                }
              });

              params.successCallback(result);
              if (select_on_load_found) {
                this.gridOptions.api.ensureIndexVisible(_.clone(this.select_on_load_position));
                this.selectSeqId(_.clone(this.select_on_load), 20);
                this.select_on_load = false;
                this.select_on_load_position = 0;
              }
              if (typeof this.init_data_source_options.loaded_cb !== 'undefined') {
                this.init_data_source_options.loaded_cb(null, result, this);
              }
            } else if (err === 'Not logged') {
              this.state.$notify({
                title: 'セッションの有効期限が切れましたので、もう一度ログインを行ってください',
                // text: "",
                type: 'error',
                duration: 5000,
              });
            } else {
              this.$notify({
                title: 'データの読込中にエラーが発生しました。',
                text: err,
                type: 'error',
                duration: 5000,
              });
            }
          });
        },
      };
      this.pageDataSource.setState(this);
      this.gridOptions.datasource = this.pageDataSource;
      if (initial_count_rows) {
        if (this.count_from_result) {
          // Do nothing
          this.setAsZeroRows();
        } else {
          this.countRows('getRows end');
        }
      } else {
        this.setAsZeroRows();
      }
    },
  },
  mounted() {},
};
