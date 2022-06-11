

var fs = require('fs');
var path = require('path');
var uuid = require('uuid');
var moment = require('moment');
moment.suppressDeprecationWarnings = true;
var shelljs = require('shelljs');
var build_helper = require('./helper.js');

// Define the versions
const PROJECT_NAME = "e-project";
const VERSION = "1.0.0";
var NOW = moment(new Date()).format("YYYY/MM/DD HH:mm:ss")
const BUILD_ID = moment(NOW).format("YYYYMMDD_HHmmss")

// Define the paths
const BASE_PATH = path.join(__dirname,"../../")
const OUTPUT_PATH = path.join(BASE_PATH,"dev/output/")
const BUILD_PATH = path.join(OUTPUT_PATH, PROJECT_NAME)
const BUILD_APP_PATH = path.join(BUILD_PATH,"app")
const BUILD_TEMP_PUBLIC_PATH = path.join(BUILD_APP_PATH,"public")
const BUILD_UTILS_PATH = path.join(BUILD_PATH,"utils")
const BUILD_SCRIPTS_PATH = path.join(BUILD_UTILS_PATH,"Scripts")
const API_SOURCE_PATH = path.join(BASE_PATH,"api")
const UI_SOURCE_PATH = path.join(BASE_PATH,"ui")
const UI_DIST_PATH = path.join(UI_SOURCE_PATH,"dist")

// Ensure the aws_config_file path exists
const AWS_CONFIG_FILE = path.join(BASE_PATH,"local_files/aws_config_file.json")
if(fs.existsSync(AWS_CONFIG_FILE) == false){
  console.log("ERROR: AWS_CONFIG_FILE does not exist at ", { AWS_CONFIG_FILE });
  process.exit(1);
}

//* Create initial folders.
shelljs.rm("-fr",path.join(BUILD_PATH,"*"))
build_helper.ensure_path(BUILD_TEMP_PUBLIC_PATH)
build_helper.ensure_path(BUILD_UTILS_PATH)

if(true){
// * Copy API files.
build_helper.copy_dir(API_SOURCE_PATH,BUILD_APP_PATH,["node_modules","uploads","public","test","temp","logs","*.sh","SyncToy*","*.sql"])
build_helper.ensure_path(path.join(BUILD_APP_PATH,"uploads"))
build_helper.ensure_path(path.join(BUILD_APP_PATH,"temp"))
build_helper.ensure_path(path.join(BUILD_APP_PATH,"logs"))
build_helper.ensure_path(path.join(BUILD_APP_PATH,"public/static"))
}
shelljs.cp(path.join(AWS_CONFIG_FILE),path.join(BUILD_APP_PATH,"config"))

if(true){
// * Build Vue.
shelljs.exec("cd " + UI_SOURCE_PATH + " && npm run build")
}
build_helper.line_find_and_replace(path.join(BUILD_APP_PATH,"package.json"),'"version"','  "version": "'+VERSION+'",')
// * Copy Vue files.
build_helper.copy_dir(UI_DIST_PATH,BUILD_TEMP_PUBLIC_PATH,[])
var GIT_VERSION = shelljs.exec("git rev-parse HEAD").stdout
fs.writeFileSync(path.join(BUILD_APP_PATH,"version.txt"),"Ver: "+VERSION+"\nBuild: " + BUILD_ID + "\nGit: " + GIT_VERSION)
shelljs.cp(path.join(BUILD_APP_PATH,"version.txt"),path.join(BUILD_TEMP_PUBLIC_PATH,""))
shelljs.cp(path.join(BUILD_APP_PATH,"version.txt"),path.join(BUILD_TEMP_PUBLIC_PATH,"static"))

build_helper.zip_dir(OUTPUT_PATH, PROJECT_NAME, PROJECT_NAME + "_" + VERSION.replace(/\./g,"_") + "_" + BUILD_ID + "_aws.zip" )

console.log("Finished building AWS package.")