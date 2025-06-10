CREATE TABLE IF NOT EXISTS `rent_history` (
  `seq_id` int NOT NULL AUTO_INCREMENT,
  `car_id` int NOT NULL,
  `entity_code` varchar(64) NOT NULL,
  `customer_id` varchar(16) DEFAULT NULL,
  `from_date` datetime NOT NULL,
  `to_date` datetime DEFAULT NULL,
  `total_rent_hours` int DEFAULT NULL,
  `rent_value` int DEFAULT NULL,
  `notes` varchar(4096) DEFAULT NULL,
  PRIMARY KEY (`seq_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;