CREATE TABLE IF NOT EXISTS `master_color` (
  `seq_id` int NOT NULL AUTO_INCREMENT,
  `color_name` varchar(64) NOT NULL,
  `color_code` varchar(64) NOT NULL,
  PRIMARY KEY (`seq_id`),
  UNIQUE KEY `color_code` (`color_code`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;