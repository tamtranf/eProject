var fs = require('fs');
var path = require('path');
var moment = require('moment');
var uuid = require('uuid');
var _ = require('lodash');
var shelljs = require('shelljs');
var is_windows = /^win/.test(process.platform);

var check_path_contain_ignore = (check_path, ignore_arr) => {
  var ret = false
  ignore_arr.forEach(e=>{
    var temp = e.replace("*","");
    if(_.startsWith(e,"*")&& _.endsWith(check_path,temp)){
      ret = true
    }else if(_.endsWith(e,"*") && _.startsWith(check_path,temp)){
      ret = true
    }
  })
  return ret;
}

module.exports = {
  is_windows:is_windows,
  ensure_path: (work_path) =>{
    if(fs.existsSync(work_path) == false){
      fs.mkdirSync(work_path,{recursive:true})
    }
  },
  create_dirs:(to,dirs)=>{
    dirs.forEach(dir=>{
      var working_dir = path.join(to,dir);
      shelljs.mkdir("-p",working_dir)
    })
  },
  copy_dir:(from,to,ignore_arr) =>{
    var dirs = fs.readdirSync(from);
    dirs.forEach(dir=>{
      var working_dir = path.join(from,dir);
      var dest_dir = path.join(to,dir);
      if(ignore_arr.indexOf(dir) > -1 || check_path_contain_ignore(dir,ignore_arr)){
      }else{
        shelljs.cp("-r",working_dir,dest_dir)
      }
    })
  },
  line_find_and_replace:(file_path,find_line,new_line)=>{
    var content = fs.readFileSync(file_path,"utf8")
    var s_arr = content.split("\n");
    var len = s_arr.length;
    for(var i = 0; i < len;i++){
      if(s_arr[i].indexOf(find_line) > -1){
        s_arr[i] = new_line;
      }
    }
    fs.writeFileSync(file_path,s_arr.join("\n"))
  },
  term_find_and_replace:(file_path,find_term,new_term)=>{
    var content = fs.readFileSync(file_path,"utf8")
    var s_arr = content.split("\n");
    var len = s_arr.length;
    for(var i = 0; i < len;i++){
      if(s_arr[i].indexOf(find_term) > -1){
        s_arr[i] = s_arr[i].replace(find_term,new_term);
      }
    }
    fs.writeFileSync(file_path,s_arr.join("\n"))
  },
  zip_dir(work_dir, dir_path, destination_zip){
    console.log('zip_dir',{work_dir, dir_path, destination_zip});

    if(is_windows){
      if(fs.existsSync(path.join(work_dir,"7za.exe")) == false){
        shelljs.exec('copy  ' + path.join(__dirname,"7za.exe") + " "  + work_dir );
      }
      shelljs.exec('cd ' + work_dir + ' && 7za.exe a -tzip ' + destination_zip + ' ' + dir_path +'');
    }else{
      shelljs.exec('cd ' + work_dir + ' && zip -r ' + destination_zip + ' ' + dir_path + ' -x "*.DS_Store" ');
    }
  }
};
