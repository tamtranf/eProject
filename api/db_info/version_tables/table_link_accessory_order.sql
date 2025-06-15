CREATE TABLE IF NOT EXISTS `link_accessory_order` (
  `seq_id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(64) NOT NULL,
  `accessory_code_id` varchar(64) NOT NULL,
  PRIMARY KEY (`seq_id`),
  KEY `order_id` (`order_id`),
  KEY `accessory_code_id` (`accessory_code_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;