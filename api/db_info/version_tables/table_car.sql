CREATE TABLE IF NOT EXISTS `car` (
  `seq_id` int NOT NULL AUTO_INCREMENT,
  `maker` varchar(64) NOT NULL,
  `model` varchar(64) NOT NULL,
  `license_plate` varchar(8) NOT NULL,
  `car_year` smallint NOT NULL,
  `color` varchar(64) NOT NULL,
  `passenger` tinyint NOT NULL,
  `category` varchar(64) NOT NULL,
  `weight` smallint NOT NULL,
  `price_per_day` int NOT NULL,
  `status` varchar(64) NOT NULL,
  `notes` varchar(4048) NOT NULL,
  PRIMARY KEY (`seq_id`),
  UNIQUE KEY `license_plate` (`license_plate`),
  KEY `model` (`model`),
  KEY `maker` (`maker`),
  KEY `status` (`status`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;