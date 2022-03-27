import _ from 'lodash';
import moment from 'moment';

import { AgGridVue } from 'ag-grid-vue3';
import SearchControl from '@/components/search/search-control';

export default {
  data() {
    return {

    };
  },
  computed: {
    commonGridOptions() {
      return {
        defaultColDef: {
          editable: false,
        },
        getRowNodeId: (data) => data.seq_id,
        // enableSorting: true,
        // enableColResize: true,

        // suppressMovableColumns: true,
        rowSelection: 'single',
        // suppressHorizontalScroll: true,
        // overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">対象のデータはありません</span>',
        // overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Loading...</span>',
        onColumnResized: (_ev) => {
        },
        onRowSelected: (ev) => {
          if (typeof this.onRowSelected !== 'undefined') {
            if (ev.node.isSelected()) {
              return this.onRowSelected(ev);
            }
          }
        },
        onModelUpdated: (_ev, _d) => {
        },
        onGridReady: () => {
        },
        getRowStyle: (params) => {
          if (params.node.data && (params.node.data.is_selected === true || this.isAllSelected === true)) {
            if (this.getRowStyleBackground) {
              return { background: this.getRowStyleBackground };
            }
            return { background: 'orange' };
          }
        },
      };
    },
    defaultCreateColumn() {
      return _.cloneDeep([
        {
          headerName: 'Seq', // sequence can be used to define the sequence of records
          field: 'seq_id',
          hide: true,
          sort: 'desc',
        },
        {
          headerName: 'SearchControl', // Used to filter manually
          field: 'search_control',
          hide: true,
        },
        {
          headerName: 'SearchFlowControl', // Used to filter manually
          field: 'search_flow_control',
          hide: true,
        },
      ]);
    },
  },
  methods: {
    commonDeleteSelected(cb = () => {}) {
      if (this.selectedRowArr.length === 0) {
        return cb('No selected items');
      }
      const body = {
        array: this.selectedRowArr.map((m) => m.seq_id),
      };
      body.array_match3 = body.array.length * 3;
      this.$ajax.post(`/${this.api_name}/delete_arr/`, body, (err, result) => {
        this.retrieved_value = (result && result.data) || {};
        this.is_new = false;
        this.gridOptions.api.purgeInfiniteCache();
        this.countRows('commonDeleteSelected');
        cb(err, result);
      });
    },
    onDetailsClick(_ev, data) {
      console.log('No listener set to onDetailsClick at .vue file ', { data });
    },
    format_date(d) {
      if (typeof d == 'undefined' || d === false || d === null || d === '') {
        return '';
      }
      return moment(d).format('YYYY/MM/DD');
    },
    format_date_time(dt) {
      if (typeof dt === 'undefined' || dt === false || dt === null || dt === '') {
        return '';
      }
      return moment(dt).format('YYYY/MM/DD HH:mm');
    },
    format_date_time_s(dt) {
      if (typeof dt === 'undefined' || dt === false || dt === null || dt === '') {
        return '';
      }
      return moment(dt).format('YYYY/MM/DD HH:mm:ss');
    },
    createGridButton(icon, style, onClick, row_data) {
      const center = document.createElement('center');
      const btn = document.createElement('button');
      // btn.style.cssText="background:red;"
      btn.className = 'btn btn-link btn-xs ag-grid-tab-button';
      btn.innerHTML = `<center><span class="${icon}" style="${style}" aria-hidden="true"></span></center>`;
      btn.addEventListener('click', (ev) => {
        onClick(ev, row_data);
      });
      center.appendChild(btn);
      return center;
    },
    createGridTextButton(text, style, onClick, row_data) {
      const center = document.createElement('center');
      const btn = document.createElement('button');
      // btn.style.cssText="background:red;"
      btn.className = 'btn btn-link btn-xs ag-grid-tab-button';
      btn.innerHTML = `<center><span style="${style}" aria-hidden="true">${text}</span></center>`;
      btn.addEventListener('click', (ev) => {
        onClick(ev, row_data);
      });
      center.appendChild(btn);
      return center;
    },
    commonCreateColumnDefs({
      show_details, show_checkbox, field_list_name, force_sort = false,
    }) {
      const arr = _.clone(this.defaultCreateColumn);

      if (force_sort !== false) {
        arr.forEach((e) => {
          delete e.sort;
        });
      }
      // const i = 0;
      if (typeof field_list_name === 'undefined') {
        // eslint-disable-next-line no-param-reassign
        field_list_name = 'tabFieldList';
      }
      this[field_list_name].forEach((f) => {
        const fi = {
          headerName: f.tab_label,
          field: f.id,
          resizable: true,
          sortable: true,
          width: f.tab_size || 140,
          tooltipField: f.id,
        };
        if (f.suppressSorting === true) {
          fi.suppressSorting = true;
        }
        if (force_sort !== false) {
          if (force_sort.id === fi.field) {
            fi.sort = force_sort.direction;
            this.last_data_source_sort = [{
              colId: fi.field,
              sort: force_sort.direction,
            }];
          }
        }
        if (f.type === 'date_picker') {
          if (f.show_time === true) {
            fi.cellRenderer = (params) => this.format_date_time(params.value);
          } else {
            fi.cellRenderer = (params) => this.format_date(params.value);
          }
        } else if (f.type === 'select') {
          fi.cellRenderer = (params) => {
            if (f.table_field_style && _.size(f.table_field_style) > 0) {
              return `<span style='${f.table_field_style[params.value]}'>${params.value}</span>`;
            }
            return params.value;
          };
        } else if (f.type === 'select2') {
          fi.cellRenderer = (params) => {
            const found = _.find(f.options, (d) => params.value === d.value);
            let ret = '';
            if (found && typeof found !== 'undefined') {
              ret = found.label;
            } else {
              ret = params.value;
            }
            if (f.table_field_style && _.size(f.table_field_style) > 0 && typeof f.table_field_style[params.value] !== 'undefined') {
              return `<span style='${f.table_field_style[params.value]}'>${ret}</span>`;
            }
            return ret;
          };
        } else if (f.type === 'select4' && typeof f.api_tab_label !== 'undefined') {
          fi.cellRenderer = (params) => {
            if (typeof f.api_complement_array !== 'undefined' && Array.isArray(f.api_complement_array)) {
              const found = _.find(f.api_complement_array, (d) => params.value === d[f.api_field_name]);
              if (found && found[f.api_tab_label]) {
                return found[f.api_tab_label];
              }
            }
            return _.get(params, `data.${f.api_tab_label}`, params.value) || params.value;
          };
        } else if (f.type === 'datetime_picker' || f.type === 'date_picker' || f.type === 'current_time') {
          fi.cellRenderer = (params) => this.format_date_time(params.value);
        } else if (f.cellRenderer) {
          fi.cellRenderer = f.cellRenderer;
        }
        if (this.cellStyle) {
          fi.cellStyle = this.cellStyle;
        }
        arr.push(fi);
      });
      const extra_fields = [];
      if (show_details === true) {
        extra_fields.push(this.fieldList.more_details || {
          id: 'more_details', tab_label: '詳細', type: 'input',
        });
      }
      if (show_checkbox === true) {
        extra_fields.push(this.fieldList.button_options || { id: 'button_options', tab_label: 'ﾁｪｯｸ', type: 'input' });
      }

      extra_fields.forEach((f) => {
        const fi = {
          headerName: f.tab_label,
          sortable: false,
          field: f.id,
          resizable: true,
          maxWidth: 70,
          minWidth: 50,
          pinned: 'right',
          cellRenderer: (params) => {
            if (params.column.colId === 'more_details') {
              return this.createGridTextButton(
                this.show_details_label || '詳細',
                'color: #5b9bd5;',
                this.onDetailsClick,
                params.data,
              );
            }
            if (params.column.colId === 'button_options') {
              if (this.hideCheckBox) {
                if (this.hideCheckBox(params.data) === true) {
                  return '';
                }
              }
              return this.createGridButton(
                'bi bi-square',
                'color: #5b9bd5;',
                (ev, selected_row) => {
                  if (this.hideCheckBox) {
                    if (this.hideCheckBox(params.data) === true) {
                      return;
                    }
                  }
                  this.onSelectedClickDatasource(ev, selected_row);
                },
                params.data,
              );
            }
          },
        };
        arr.push(fi);
      });
      return arr;
    },

  },
  components: { AgGridVue, SearchControl },
  mounted() {

  },
};
