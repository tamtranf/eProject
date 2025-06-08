CREATE TABLE IF NOT EXISTS `master_category` (
  `seq_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(64) NOT NULL,
  `category_code` varchar(64) NOT NULL,
  PRIMARY KEY (`seq_id`),
  UNIQUE KEY `category_code` (`category_code`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;