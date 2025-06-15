CREATE TABLE IF NOT EXISTS `order_control` (
  `seq_id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(64) NOT NULL,
  `customer_id` varchar(16) DEFAULT NULL,
  `car_code_id` varchar(64) DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'pending',
  `total_value` int DEFAULT NULL,
  `notes` varchar(4096) DEFAULT NULL,
  `entity_code` varchar(64) DEFAULT NULL,
  `incharge_user_name` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`seq_id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `customer_id` (`customer_id`),
  KEY `car_code_id` (`car_code_id`),
  KEY `status` (`status`),
  KEY `entity_code` (`entity_code`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;