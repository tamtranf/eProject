CREATE TABLE IF NOT EXISTS `master_year` (
  `seq_id` int NOT NULL AUTO_INCREMENT,
  `year_name` varchar(64) NOT NULL,
  `year_code` varchar(64) NOT NULL,
  PRIMARY KEY (`seq_id`),
  UNIQUE KEY `year_code` (`year_code`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;