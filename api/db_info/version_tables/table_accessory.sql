CREATE TABLE IF NOT EXISTS `accessory` (
  `seq_id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(64) NOT NULL,
  `code_id` varchar(64) NOT NULL,
  `name` varchar(64) NOT NULL,
  `color` varchar(64) DEFAULT NULL,
  `notes` varchar(4096) DEFAULT NULL,
  `entity_code` varchar(64) NOT NULL,
  PRIMARY KEY (`seq_id`),
  UNIQUE KEY `code_id` (`code_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;