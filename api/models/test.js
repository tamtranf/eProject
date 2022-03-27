const os = require('os');
const fs = require('fs');
const md5 = require('md5');
const path = require('path');
const DataUtils = require('../libs/data_utils');
const ResponseUtils = require('../libs/response_utils');
const BaseModel = require('../libs/base_model');
const constants = require('../rules/constants');
const debug = require('../libs/debug').create('TestModel');

class TestModel extends BaseModel {
  constructor() {
    super();
    debug('Started');
    this.id = 'test';
    this.table = 'master_test';
    this.form_fields = 'test_field, seq_id';
    this.routes = {
      test: {
        method: 'get', func: 'test_func', path: '/', no_login: true,
      },
      test_access: {
        method: 'get', func: 'test_access', path: '/access', no_login: true,
      },
      test_disk: {
        method: 'get', func: 'test_disk', path: '/disk', no_login: true,
      },
      test_db: {
        method: 'get', func: 'test_db', path: '/db', no_login: true,
      },
      get_options: {
        method: 'post', func: 'get_options', path: '/get_options', no_login: true,
      },
    };
    // this.populate_master_template(() => {});
    // this.populate_master_template(() => {});
    // this.populate_master_template(() => {});
    // this.populate_master_template(() => {});
    // this.populate_master_template(() => {});
    // this.populate_master_template(() => {});
  }

  get_fields() {
    return [];
  }

  test_func(req, res) {
    ResponseUtils.response(req, res, { test: 123, constants }, null);
  }

  test_access(req, res) {
    let server_info = 'Server Info:<br>';
    server_info += `platform: ${os.platform()}<br>`;
    server_info += `release: ${os.release()}<br>`;
    server_info += `version: ${os.version()}<br>`;
    server_info += `cpus: ${os.cpus()[0].model}<br>`;
    server_info += `cpus(threads): ${os.cpus().length}<br>`;
    server_info += `totalmem: ${os.totalmem() / 1024 / 1024}<br>`;
    server_info += `arch: ${os.arch()}<br>`;
    server_info += `Node: ${process.version}<br>`;
    server_info += `Path: ${__dirname}<br>`;

    ResponseUtils.response(req, res, { code: 123, server_info }, null);
  }

  test_disk(req, res) {
    const base_path = path.join(__dirname, '../', 'temp');
    const file_path = path.join(base_path, 'test_file.txt');
    if (fs.existsSync(base_path) === false) {
      fs.mkdirSync(base_path, { recursive: true });
    }
    const time = `${new Date().getTime()}`;
    fs.writeFile(file_path, time, (err) => {
      if (err) {
        ResponseUtils.response(req, res, {}, err);
      }
      fs.readFile(file_path, 'utf8', (err2, loaded_data) => {
        if (err2) {
          return ResponseUtils.response(req, res, {}, err2);
        }
        if (loaded_data === time) {
          ResponseUtils.response(req, res, { time }, null);
        }
      });
    });
  }

  test_db(req, res) {
    const time = `${new Date().getTime()}_str`;
    const time_int = new Date().getSeconds();
    DataUtils.query('INSERT INTO master_test (test_field,test_number)VALUES(?,?)', [time, time_int], {}, (err) => {
      if (err) {
        console.log('ERROR at insert', { err });
        return ResponseUtils.response(req, res, {}, err);
      }
      DataUtils.query('SELECT * FROM master_test order by seq_id  desc limit 0,1', [], {}, (err2, data) => {
        if (err2) {
          console.log('ERROR at SELECT', { err2 });
          return ResponseUtils.response(req, res, {}, err2);
        }
        ResponseUtils.response(req, res, { data: data[0] });
      });
    });
  }

  get_options(req, res) {
    // this is a sample list of options, for test usage, it will not collect it from the DB, but local

    const list = [];
    const toyota = ['Harrier', 'Corola', 'Camry', 'Avalon', 'Auris', 'Yaris', 'Prius', 'Altis', 'Civic', 'CR-V', 'Hilux', 'Land Cruiser',
      'RAV4', 'Avalon Hybrid', 'Altis Hybrid', 'C-HR', 'Highlander', 'Highlander Hybrid'];
    const honda = ['Accord', 'Civic', 'CR-V', 'Hilux', 'Land Cruiser', 'RAV4', 'Avalon Hybrid', 'Altis Hybrid', 'C-HR', 'Highlander', 'Highlander Hybrid'];
    const nissan = ['Versa', 'Sentra', 'Maxima', 'Altima', 'Pathfinder', 'Frontier', 'Versa Note', 'Sentra Note', 'Maxima Note', 'Altima Note', 'Pathfinder Note', 'Frontier Note'];
    const mazda = ['CX-3', 'CX-5', 'CX-7', 'CX-9', 'Mazda3', 'Mazda5', 'Mazda6', 'MazdaCX-7', 'MazdaCX-9', 'MazdaCX-30'];
    const mitsubishi = ['Lancer', 'Lancer Evolution', 'Outlander', 'Lancer EVO', 'Lancer Sportback', 'Lancer EVO II', 'Lancer EVO XJ'];

    let seq = 100;
    toyota.forEach((car) => {
      list.push({
        id: seq += 1, name: car, group: 'Toyota', code: 'TOY',
      });
    });
    seq = 200;
    honda.forEach((car) => {
      list.push({
        id: seq += 1, name: car, group: 'Honda', code: 'HON',
      });
    });
    seq = 300;
    nissan.forEach((car) => {
      list.push({
        id: seq += 1, name: car, group: 'Nissan', code: 'NIS',
      });
    });
    seq = 400;
    mazda.forEach((car) => {
      list.push({
        id: seq += 1, name: car, group: 'Mazda', code: 'MAZ',
      });
    });
    seq = 500;
    mitsubishi.forEach((car) => {
      list.push({
        id: seq += 1, name: car, group: 'Mitsubishi', code: 'MIT',
      });
    });

    list.forEach((l) => {
      l.id = l.name;
      l.key = md5(l.id);
      l.key2 = md5(l.id * l.id);
      l.name = `${l.name}`;
    });

    ResponseUtils.response(req, res, { list });
  }

  populate_master_template(cb) {
    const async = require('async');
    const moment = require('moment');
    const list = [];
    const toyota = ['Harrier', 'Corola', 'Camry', 'Avalon', 'Auris', 'Yaris', 'Prius', 'Altis', 'Civic', 'CR-V', 'Hilux', 'Land Cruiser',
      'RAV4', 'Avalon Hybrid', 'Altis Hybrid', 'C-HR', 'Highlander', 'Highlander Hybrid'];
    const honda = ['Accord', 'Civic', 'CR-V', 'Hilux', 'Land Cruiser', 'RAV4', 'Avalon Hybrid', 'Altis Hybrid', 'C-HR', 'Highlander', 'Highlander Hybrid'];
    const nissan = ['Versa', 'Sentra', 'Maxima', 'Altima', 'Pathfinder', 'Frontier', 'Versa Note', 'Sentra Note', 'Maxima Note', 'Altima Note', 'Pathfinder Note', 'Frontier Note'];
    const mazda = ['CX-3', 'CX-5', 'CX-7', 'CX-9', 'Mazda3', 'Mazda5', 'Mazda6', 'MazdaCX-7', 'MazdaCX-9', 'MazdaCX-30'];
    const mitsubishi = ['Lancer', 'Lancer Evolution', 'Outlander', 'Lancer EVO', 'Lancer Sportback', 'Lancer EVO II', 'Lancer EVO XJ'];

    let seq = 100;
    toyota.forEach((car) => {
      list.push({
        id: seq += 1, name: car, group: 'Toyota', code: 'TOY',
      });
    });
    seq = 200;
    honda.forEach((car) => {
      list.push({
        id: seq += 1, name: car, group: 'Honda', code: 'HON',
      });
    });
    seq = 300;
    nissan.forEach((car) => {
      list.push({
        id: seq += 1, name: car, group: 'Nissan', code: 'NIS',
      });
    });
    seq = 400;
    mazda.forEach((car) => {
      list.push({
        id: seq += 1, name: car, group: 'Mazda', code: 'MAZ',
      });
    });
    seq = 500;
    mitsubishi.forEach((car) => {
      list.push({
        id: seq += 1, name: car, group: 'Mitsubishi', code: 'MIT',
      });
    });

    list.forEach((l) => {
      l.id = l.name;
      l.key = md5(l.id);
      l.key2 = md5(l.id * l.id);
      l.name = `${l.name}`;
    });
    async.mapLimit(list, 1, (_item, done) => {
      const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
      const names = ['John', 'Peter', 'Sally', 'Jane', 'Jack', 'Paul', 'Mark', 'Samantha', 'Emily', 'Kate', 'Emily', 'Kate', 'Jack', 'Paul', 'Mark', 'Samantha', 'Jane', 'Sally', 'Peter', 'John'];
      const surnames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
        'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson',
        'SMITH', 'JOHNSON', 'WILLIAMS', 'BROWN', 'JONES', 'GARCIA', 'MILLER', 'DAVIS', 'RODRIGUEZ', 'MARTINEZ', 'HERNANDEZ', 'LOPEZ',
        'GONZALEZ', 'WILSON', 'ANDERSON', 'THOMAS', 'TAYLOR', 'MOORE', 'JACKSON', 'MARTIN', 'LEE', 'PEREZ', 'THOMPSON', 'WHITE', 'HARRIS',
        'SANCHEZ', 'CLARK', 'RAMIREZ', 'LEWIS', 'ROBINSON', 'WALKER', 'YOUNG', 'ALLEN', 'KING', 'WRIGHT', 'SCOTT', 'TORRES', 'NGUYEN', 'HILL',
        'FLORES', 'GREEN', 'ADAMS', 'NELSON', 'BAKER', 'HALL', 'RIVERA', 'CAMPBELL', 'MITCHELL', 'CARTER', 'ROBERTS', 'GOMEZ', 'PHILLIPS', 'EVANS',
        'TURNER', 'DIAZ', 'PARKER', 'CRUZ', 'EDWARDS', 'COLLINS', 'REYES', 'STEWART', 'MORRIS', 'MORALES', 'MURPHY', 'COOK', 'ROGERS', 'GUTIERREZ',
        'ORTIZ', 'MORGAN', 'COOPER', 'PETERSON', 'BAILEY', 'REED', 'KELLY', 'HOWARD', 'RAMOS', 'KIM', 'COX', 'WARD', 'RICHARDSON', 'WATSON',
        'BROOKS', 'CHAVEZ', 'WOOD', 'JAMES', 'BENNETT', 'GRAY', 'MENDOZA', 'RUIZ', 'HUGHES', 'PRICE', 'ALVAREZ', 'CASTILLO', 'SANDERS', 'PATEL',
        'MYERS', 'LONG', 'ROSS', 'FOSTER', 'JIMENEZ', 'POWELL', 'JENKINS', 'PERRY', 'RUSSELL', 'SULLIVAN', 'BELL', 'COLEMAN', 'BUTLER',
        'HENDERSON', 'BARNES', 'GONZALES', 'FISHER', 'VASQUEZ', 'SIMMONS', 'ROMERO', 'JORDAN', 'PATTERSON', 'ALEXANDER', 'HAMILTON', 'GRAHAM',
        'REYNOLDS', 'GRIFFIN', 'WALLACE', 'MORENO', 'WEST', 'COLE', 'HAYES', 'BRYANT', 'HERRERA', 'GIBSON', 'ELLIS', 'TRAN', 'MEDINA', 'AGUILAR',
        'STEVENS', 'MURRAY', 'FORD', 'CASTRO', 'MARSHALL', 'OWENS', 'HARRISON', 'FERNANDEZ', 'McDONALD', 'WOODS', 'WASHINGTON', 'KENNEDY', 'WELLS',
        'VARGAS', 'HENRY', 'CHEN', 'FREEMAN', 'WEBB', 'TUCKER', 'GUZMAN', 'BURNS', 'CRAWFORD', 'OLSON', 'SIMPSON', 'PORTER', 'HUNTER', 'GORDON',
        'MENDEZ', 'SILVA', 'SHAW', 'SNYDER', 'MASON', 'DIXON', 'MUÑOZ', 'HUNT', 'HICKS', 'HOLMES', 'PALMER', 'WAGNER', 'BLACK', 'ROBERTSON',
        'BOYD', 'ROSE', 'STONE', 'SALAZAR', 'FOX', 'WARREN', 'MILLS', 'MEYER', 'RICE', 'SCHMIDT', 'GARZA', 'DANIELS', 'FERGUSON', 'NICHOLS',
        'STEPHENS', 'SOTO', 'WEAVER', 'RYAN', 'GARDNER', 'PAYNE', 'GRANT', 'DUNN', 'KELLEY', 'SPENCER', 'HAWKINS', 'ARNOLD', 'PIERCE', 'VAZQUEZ',
        'HANSEN', 'PETERS', 'SANTOS', 'HART', 'BRADLEY', 'KNIGHT', 'ELLIOTT', 'CUNNINGHAM', 'DUNCAN', 'ARMSTRONG', 'HUDSON', 'CARROLL', 'LANE',
        'RILEY', 'ANDREWS', 'ALVARADO', 'RAY', 'DELGADO', 'BERRY', 'PERKINS', 'HOFFMAN', 'JOHNSTON', 'MATTHEWS', 'PEÑA', 'RICHARDS', 'CONTRERAS',
        'WILLIS', 'CARPENTER', 'LAWRENCE', 'SANDOVAL', 'GUERRERO', 'GEORGE', 'CHAPMAN', 'RIOS', 'ESTRADA', 'ORTEGA', 'WATKINS', 'GREENE', 'NUÑEZ',
        'WHEELER', 'VALDEZ', 'HARPER', 'BURKE', 'LARSON', 'SANTIAGO', 'MALDONADO', 'MORRISON', 'FRANKLIN', 'CARLSON', 'AUSTIN', 'DOMINGUEZ',
        'CARR', 'LAWSON', 'JACOBS', 'O’BRIEN', 'LYNCH', 'SINGH', 'VEGA', 'BISHOP', 'MONTGOMERY', 'OLIVER', 'JENSEN', 'HARVEY', 'WILLIAMSON',
        'GILBERT', 'DEAN', 'SIMS', 'ESPINOZA', 'HOWELL', 'LI', 'WONG', 'REID', 'HANSON', 'LE', 'McCOY', 'GARRETT', 'BURTON', 'FULLER', 'WANG',
        'WEBER', 'WELCH', 'ROJAS', 'LUCAS', 'MARQUEZ', 'FIELDS', 'PARK', 'YANG', 'LITTLE', 'BANKS', 'PADILLA', 'DAY', 'WALSH', 'BOWMAN',
        'SCHULTZ', 'LUNA', 'FOWLER', 'MEJIA', 'DAVIDSON', 'ACOSTA', 'BREWER', 'MAY', 'HOLLAND', 'JUAREZ', 'NEWMAN', 'PEARSON', 'CURTIS',
        'CORTÉZ', 'DOUGLAS', 'SCHNEIDER', 'JOSEPH', 'BARRETT', 'NAVARRO', 'FIGUEROA', 'KELLER', 'ÁVILA', 'WADE', 'MOLINA', 'STANLEY',
        'HOPKINS', 'CAMPOS', 'BARNETT', 'BATES', 'CHAMBERS', 'CALDWELL', 'BECK', 'LAMBERT', 'MIRANDA', 'BYRD', 'CRAIG', 'AYALA', 'LOWE',
        'FRAZIER', 'POWERS', 'NEAL', 'LEONARD', 'GREGORY', 'CARRILLO', 'SUTTON', 'FLEMING', 'RHODES', 'SHELTON', 'SCHWARTZ', 'NORRIS',
        'JENNINGS', 'WATTS', 'DURAN', 'WALTERS', 'COHEN', 'McDANIEL', 'MORAN', 'PARKS', 'STEELE', 'VAUGHN', 'BECKER', 'HOLT', 'DELEON',
        'BARKER', 'TERRY', 'HALE', 'LEON', 'HAIL', 'BENSON', 'HAYNES', 'HORTON', 'MILES', 'LYONS', 'PHAM', 'GRAVES', 'BUSH', 'THORNTON',
        'WOLFE', 'WARNER', 'CABRERA', 'McKINNEY', 'MANN', 'ZIMMERMAN', 'DAWSON', 'LARA', 'FLETCHER', 'PAGE', 'McCARTHY', 'LOVE', 'ROBLES',
        'CERVANTES', 'SOLIS', 'ERICKSON', 'REEVES', 'CHANG', 'KLEIN', 'SALINAS', 'FUENTES', 'BALDWIN', 'DANIEL', 'SIMON', 'VELASQUEZ',
        'HARDY', 'HIGGINS', 'AGUIRRE', 'LIN', 'CUMMINGS', 'CHANDLER', 'SHARP', 'BARBER', 'BOWEN', 'OCHOA', 'DENNIS', 'ROBBINS', 'LIU',
        'RAMSEY', 'FRANCIS', 'GRIFFITH', 'PAUL', 'BLAIR', 'O’CONNOR', 'CARDENAS', 'PACHECO', 'CROSS', 'CALDERON', 'QUINN', 'MOSS',
        'SWANSON', 'CHAN', 'RIVAS', 'KHAN', 'RODGERS', 'SERRANO', 'FITZGERALD', 'ROSALES', 'STEVENSON', 'CHRISTENSEN', 'MANNING',
        'GILL', 'CURRY', 'McLAUGHLIN', 'HARMON', 'McGEE', 'GROSS', 'DOYLE', 'GARNER', 'NEWTON', 'BURGESS', 'REESE', 'WALTON', 'BLAKE',
        'TRUJILLO', 'ADKINS', 'BRADY', 'GOODMAN', 'ROMAN', 'WEBSTER', 'GOODWIN', 'FISCHER', 'HUANG', 'POTTER', 'DELACRUZ', 'MONTOYA',
        'TODD', 'WU', 'HINES', 'MULLINS', 'CASTANEDA', 'MALONE', 'CANNON', 'TATE', 'MACK', 'SHERMAN', 'HUBBARD', 'HODGES', 'ZHANG',
        'GUERRA', 'WOLF', 'VALENCIA', 'SAUNDERS', 'FRANCO', 'ROWE', 'GALLAGHER', 'FARMER', 'HAMMOND', 'HAMPTON', 'TOWNSEND', 'INGRAM',
        'WISE', 'GALLEGOS', 'CLARKE', 'BARTON', 'SCHROEDER', 'MAXWELL', 'WATERS', 'LOGAN', 'CAMACHO', 'STRICKLAND', 'NORMAN', 'PERSON',
        'COLÓN', 'PARSONS', 'FRANK', 'HARRINGTON', 'GLOVER', 'OSBORNE', 'BUCHANAN', 'CASEY', 'FLOYD', 'PATTON', 'IBARRA', 'BALL',
        'TYLER', 'SUAREZ', 'BOWERS', 'OROZCO', 'SALAS', 'COBB', 'GIBBS', 'ANDRADE', 'BAUER', 'CONNER', 'MOODY', 'ESCOBAR', 'McGUIRE',
        'LLOYD', 'MUELLER', 'HARTMAN', 'FRENCH', 'KRAMER', 'McBRIDE', 'POPE', 'LINDSEY', 'VELAZQUEZ', 'NORTON', 'McCORMICK', 'SPARKS',
        'FLYNN', 'YATES', 'HOGAN', 'MARSH', 'MACIAS', 'VILLANUEVA', 'ZAMORA', 'PRATT', 'STOKES', 'OWEN', 'BALLARD', 'LANG', 'BROCK',
        'VILLARREAL', 'CHARLES', 'DRAKE', 'BARRERA', 'CAIN', 'PATRICK', 'PIÑEDA', 'BURNETT', 'MERCADO', 'SANTANA', 'SHEPHERD', 'BAUTISTA',
        'ALI', 'SHAFFER', 'LAMB', 'TREVINO', 'McKENZIE', 'HESS', 'BEIL', 'OLSEN', 'COCHRAN', 'MORTON', 'NASH', 'WILKINS', 'PETERSEN',
        'BRIGGS', 'SHAH', 'ROTH', 'NICHOLSON', 'HOLLOWAY', 'LOZANO', 'RANGEL', 'FLOWERS', 'HOOVER', 'SHORT', 'ARIAS', 'MORA',
        'VALENZUELA', 'BRYAN', 'MEYERS', 'WEISS', 'UNDERWOOD', 'BASS', 'GREER', 'SUMMERS', 'HOUSTON', 'CARSON', 'MORROW', 'CLAYTON',
        'WHITAKER', 'DECKER', 'YODER', 'COLLIER', 'ZUNIGA', 'CAREY', 'WILCOX', 'MELENDEZ', 'POOLE', 'ROBERSON', 'LARSEN', 'CONLEY',
        'DAVENPORT', 'COPELAND', 'MASSEY', 'LAM', 'HUFF', 'ROCHA', 'CAMERON', 'JEFFERSON', 'HOOD', 'MONROE', 'ANTHONY', 'PITTMAN',
        'HUYNH', 'RANDALL', 'SINGLETON', 'KIRK', 'COMBS', 'MATHIS', 'CHRISTIAN', 'SKINNER', 'BRADFORD', 'RICHARD', 'GALVAN', 'WALL',
        'BOONE', 'KIRBY', 'WILKINSON', 'BRIDGES', 'BRUCE', 'ATKINSON', 'VELEZ', 'MEZA', 'ROY', 'VINCENT', 'YORK', 'HODGE', 'VILLA',
        'ABBOTT', 'ALLISON', 'TAPIA', 'GATES', 'CHASE', 'SOSA', 'SWEENEY', 'FARRELL', 'WYATT', 'DALTON', 'HORN', 'BARRON',
        'PHELPS', 'YU', 'DICKERSON', 'HEATH', 'FOLEY', 'ATKINS', 'MATHEWS', 'BONILLA', 'ACEVEDO', 'BENITEZ', 'ZAVALA', 'HENSLEY',
        'GLENN', 'CISNEROS', 'HARRELL', 'SHIELDS', 'RUBIO', 'HUFFMAN', 'CHOI', 'BOYER', 'GARRISON', 'ARROYO', 'BOND', 'KANE',
        'HANCOCK', 'CALLAHAN', 'DILLON', 'CLINE', 'WIGGINS', 'GRIMES', 'ARELLANO', 'MELTON', 'O’NEILL', 'SAVAGE', 'HO', 'BELTRAN',
        'PITTS', 'PARRISH', 'PONCE', 'RICH', 'BOOTH', 'KOCH', 'GOLDEN', 'WARE', 'BRENNAN', 'McDOWELL', 'MARKS', 'CANTU', 'HUMPHREY',
        'BAXTER', 'SAWYER', 'CLAY', 'TANNER', 'HUTCHINSON', 'KAUR', 'BERG', 'WILEY', 'GILMORE', 'RUSSO', 'VILLEGAS', 'HOBBS',
        'KEITH', 'WILKERSON', 'AHMED', 'BEARD', 'McCLAIN', 'MONTES', 'MATA', 'ROSARIO', 'VANG', 'WALTER', 'HENSON', 'O’NEAL',
        'MOSLEY', 'McCLURE', 'BEASLEY', 'STEPHENSON', 'SNOW', 'HUERTA', 'PRESTON', 'VANCE', 'BARRY', 'JOHNS', 'EATON', 'BLACKWELL',
        'DYER', 'PRINCE', 'MACDONALD', 'SOLOMON', 'GUEVARA', 'STAFFORD', 'ENGLISH', 'HURST', 'WOODARD', 'CORTES', 'SHANNON',
        'KEMP', 'NOLAN', 'McCULLOUGH', 'MERRITT', 'MURILLO', 'MOON', 'SALGADO', 'STRONG', 'KLINE', 'CORDOVA', 'BARAJAS', 'ROACH', 'ROSAS',
        'WINTERS', 'JACOBSON', 'LESTER', 'KNOX', 'BULLOCK', 'KERR', 'LEACH', 'MEADOWS', 'ORR', 'DAVILA', 'WHITEHEAD', 'PRUITT', 'KENT',
        'CONWAY', 'McKEE', 'BARR', 'DAVID', 'DEJESUS', 'MARIN', 'BERGER', 'McINTYRE', 'BLANKENSHIP', 'GAINES', 'PALACIOS', 'CUEVAS', 'BARTLETT',
        'DURHAM', 'DORSEY', 'McCALL', 'O’DONNELL', 'STEIN', 'BROWNING', 'STOUT', 'LOWERY', 'SLOAN', 'McLEAN', 'HENDRICKS', 'CALHOUN',
        'SEXTON', 'CHUNG', 'GENTRY', 'HULL', 'DUARTE', 'ELLISON', 'NIELSEN', 'GILLESPIE', 'BUCK', 'MIDDLETON', 'SELLERS', 'LEBLANC', 'ESPARZA',
        'HARDIN', 'BRADSHAW', 'McINTOSH', 'HOWE', 'LIVINGSTON', 'FROST', 'GLASS', 'MORSE', 'KNAPP', 'HERMAN', 'STARK', 'BRAVO', 'NOBLE',
        'SPEARS', 'WEEKS', 'CORONA', 'FREDERICK', 'BUCKLEY', 'McFARLAND', 'HEBERT', 'ENRIQUEZ', 'HICKMAN', 'QUINTERO', 'RANDOLPH', 'SCHAEFER',
        'WALLS', 'TREJO', 'HOUSE', 'REILLY', 'PENNINGTON', 'MICHAEL', 'CONRAD', 'GILES', 'BENJAMIN', 'CROSBY', 'FITZPATRICK', 'DONOVAN', 'MAYS',
        'MAHONEY', 'VALENTINE', 'RAYMOND', 'MEDRANO', 'HAHN', 'McMILLAN', 'SMALL', 'BENTLEY', 'FELIX', 'PECK', 'LUCERO', 'BOYLE', 'HANNA',
        'PACE', 'RUSH', 'HURLEY', 'HARDING', 'McCONNELL', 'BERNAL', 'NAVA', 'AYERS', 'EVERETT', 'VENTURA', 'AVERY', 'PUGH', 'MAYER', 'BENDER',
        'SHEPARD', 'McMAHON', 'LANDRY', 'CASE', 'SAMPSON', 'MOSES', 'MAGANA', 'BLACKBURN', 'DUNLAP', 'GOULD', 'DUFFY', 'VAUGHAN', 'HERRING', 'McKAY',
        'ESPINOSA', 'RIVERS', 'FARLEY', 'BERNARD', 'ASHLEY', 'FRIEDMAN', 'POTTS', 'TRUONG', 'COSTA', 'CORREA', 'BLEVINS', 'NIXON', 'CLEMENTS', 'FRY',
        'DELAROSA', 'BEST', 'BENTON', 'LUGO', 'PORTILLO', 'DOUGHERTY', 'CRANE', 'HALEY', 'PHAN', 'VILLALOBOS', 'BLANCHARD', 'HORNE', 'FINLEY',
        'QUINTANA', 'LYNN', 'ESQUIVEL', 'BEAN', 'DODSON', 'MULLEN', 'XIONG', 'HAYDEN', 'CANO', 'LEVY', 'HUBER', 'RICHMOND', 'MOYER', 'LIM', 'FRYE',
        'SHEPPARD', 'McCARTY', 'AVALOS', 'BOOKER', 'WALLER', 'PARRA', 'WOODWARD', 'JARAMILLO', 'KRUEGER', 'RASMUSSEN', 'BRANDT', 'PERALTA',
        'DONALDSON', 'STUART', 'FAULKNER', 'MAYNARD', 'GALINDO', 'COFFEY', 'ESTES', 'SANFORD', 'BURCH', 'MADDOX', 'VO', 'O’CONNELL', 'VU', 'ANDERSEN',
        'SPENCE', 'McPHERSON', 'CHURCH', 'SCHMITT', 'STANTON', 'LEAL', 'CHERRY', 'COMPTON', 'DUDLEY', 'SIERRA', 'POLLARD', 'ALFARO', 'HESTER',
        'PROCTOR', 'LU', 'HINTON', 'NOVAK', 'GOOD', 'MADDEN', 'McCANN', 'TERRELL', 'JARVIS', 'DICKSON', 'REYNA', 'CANTRELL', 'MAYO', 'BRANCH',
        'HENDRIX', 'ROLLINS', 'ROWLAND', 'WHITNEY', 'DUKE', 'ODOM', 'DAUGHERTY', 'TRAVIS', 'TANG', 'ARCHER',
      ];

      const name = `${names[rand(0, names.length - 1)]} ${surnames[rand(0, surnames.length - 1)]}`;
      const sql = 'INSERT INTO master_template (`user_name`, `maker`, `car`, `user_password`, `retrieve_date_time`, `return_date`)VALUES(?,?,?,?,?,?)';
      const params = [name, _item.group, _item.name, rand(10000000, 90000000), moment().subtract(rand(2000, 200000), 'minutes').format('YYYY/MM/DD HH:mm:ss'),
        moment().add(rand(10000, 200000), 'minutes').format('YYYY/MM/DD')];
      DataUtils.query(sql, params, {}, (err) => {
        done(err);
      });
    }, (_err, _allDone) => {
      cb();
    });
  }
}

module.exports = new TestModel();
