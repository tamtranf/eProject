
const _ = require('lodash');
const uuid = require('uuid');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const Nseq = require('nseq');
const XlsxPopulate = require('xlsx-populate');
const ResponseUtil = require('./response_utils');

const key_list = {};
const ABC = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW',
  'AX', 'AY', 'AZ', 'BA', 'BB', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BK', 'BL', 'BM', 'BN', 'BO', 'BP', 'BQ', 'BR', 'BS', 'BT',
  'BU', 'BV', 'BW', 'BX', 'BY', 'BZ', 'CA', 'CB', 'CC', 'CD', 'CE', 'CF', 'CG', 'CH', 'CI', 'CJ', 'CK', 'CL', 'CM', 'CN', 'CO', 'CP', 'CQ',
  'CR', 'CS', 'CT', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DA', 'DB', 'DC', 'DD', 'DE', 'DF', 'DG', 'DH', 'DI', 'DJ', 'DK', 'DL', 'DM', 'DN',
  'DO', 'DP', 'DQ', 'DR', 'DS', 'DT', 'DU', 'DV', 'DW', 'DX', 'DY', 'DZ'];

const temp_directory = path.join(__dirname, '../temp');
class ExportUtil {
  constructor() {
    if (fs.existsSync(temp_directory) === false) {
      fs.mkdirSync(temp_directory);
    }
  }

  list_letters_between(last) {
    const end = ABC.indexOf(last);
    const list = [];
    for (let i = 0; i <= end; i += 1) {
      list.push(ABC[i]);
    }
    return list;
  }

  now_int() {
    return parseInt(moment(new Date()).format('YYYYMMDDHHmmss'));
  }

  future_time_int(seconds) {
    return parseInt(moment(new Date()).add(seconds, 'seconds').format('YYYYMMDDHHmmss'));
  }

  aoa(rows, template_info) {
    const aoa_list = template_info.base_aoa || [];
    const { id, local_fields } = template_info;

    let last = ABC[0];
    let first = 'A';// ABC[ABC.length - 1];
    local_fields.fields.array.forEach((field) => {
      if (field.export && field.export[id] && field.export[id].length > 0) {
        if (ABC.indexOf(field.export[id].toUpperCase()) > ABC.indexOf(last)) {
          last = field.export[id].toUpperCase();
        }
        if (ABC.indexOf(field.export[id].toUpperCase()) < ABC.indexOf(first)) {
          first = field.export[id].toUpperCase();
        }
      }
    });

    const list_cols = this.list_letters_between(last);
    template_info.dest_position = `${first}${template_info.start_row}:${last}`;

    const field_names = [];
    list_cols.forEach((l) => {
      const found = _.find(template_info.local_fields.fields.array, (o) => {
        if (o && o.export && o.export[id] && o.export[id].length > 0) {
          if (Array.isArray(o.export[id])) {
            return (o.export[id].map((m) => m.toUpperCase()).indexOf(l.toUpperCase()) > -1);
          }
          return o.export[id].toUpperCase() === l.toUpperCase();
        }
        return false;
      });

      if (found) {
        field_names.push(found.id);
      } else {
        field_names.push(false);
      }
    });
    let eof = template_info.start_row - 1;
    rows.forEach((r) => {
      eof += 1;
      aoa_list.push(field_names.map((l) => (l === false ? '' : r[l])));
    });
    template_info.dest_position += `${eof}`;
    return aoa_list;
  }

  generate(req, res, data, template_info, options = {}) {
    let aoa_list = [];
    new Nseq().do([
      (self) => {
        aoa_list = this.aoa(data, template_info);
        self.next();
      },
      (_self) => {
        const print_key = uuid.v4();
        const insert_data = {
          print_key,
          status: 'running',
          start_time: this.now_int(),
          finished_time: null,
          download_time: null,
          download_file_name: template_info.download_file_name,
          temp_path: path.join(temp_directory, `${moment(new Date()).format('YYYYMMDD_HHmmss')}_${print_key}.xlsx`),
        };
        key_list[print_key] = insert_data;
        XlsxPopulate.fromFileAsync(template_info.template_file_name).then((workbook) => {
          const r = workbook.sheet(0).range(template_info.dest_position);
          r.value(aoa_list);
          console.log('TEST DEBUG 220424 (86 at export_utils.js)[00:23]: ', {
            aoa_list,
            dp: template_info.dest_position,
          });
          if (typeof options.defined_position_field === 'object' && Object.keys(options.defined_position_field).length > 0) {
            Object.keys(options.defined_position_field).forEach((f_key) => {
              const f_val = options.defined_position_field[f_key];
              workbook.sheet(0).cell(f_key).value(f_val);
            });
          }
          workbook.toFileAsync(insert_data.temp_path);
          key_list[print_key].finished_time = this.now_int();
          key_list[print_key].status = 'finished';
          return ResponseUtil.response(req, res, {
            print_key, status: 'finished', new_mode: true,
          }, null);
        });
      },
    ]);
  }

  download(req, res) {
    const { key } = req.params;
    const data = key_list[key];
    res.download(data.temp_path, data.download_file_name);
    setTimeout(() => {
      delete key_list[key];
      fs.unlinkSync(data.temp_path);
    }, 5 * 1000);
  }
}

module.exports = new ExportUtil();
