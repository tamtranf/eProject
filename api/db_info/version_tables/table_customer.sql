CREATE TABLE IF NOT EXISTS `customer` (
  `seq_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(16) NOT NULL,
  `customer_name` varchar(64) NOT NULL,
  `phone_number` varchar(32) NOT NULL,
  `postal_code` varchar(10) NOT NULL,
  `address` varchar(128) NOT NULL,
  `created_date` date NOT NULL,
  `notes` varchar(4096) NOT NULL,
  PRIMARY KEY (`seq_id`),
  UNIQUE KEY `customer_id` (`customer_id`),
  KEY `customer_name` (`customer_name`),
  KEY `created_date` (`created_date`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;