CREATE TABLE IF NOT EXISTS `link_accessory_car` (
  `seq_id` int NOT NULL AUTO_INCREMENT,
  `car_code_id` varchar(64) NOT NULL,
  `accessory_code_id` varchar(64) NOT NULL,
  PRIMARY KEY (`seq_id`),
  UNIQUE KEY `car_code_id` (`car_code_id`, `accessory_code_id`),
  KEY `accessory_code_id` (`accessory_code_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;