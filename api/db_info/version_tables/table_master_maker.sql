CREATE TABLE IF NOT EXISTS `master_maker` (
  `seq_id` int NOT NULL AUTO_INCREMENT,
  `maker_name` varchar(64) NOT NULL,
  `maker_code` varchar(64) NOT NULL,
  PRIMARY KEY (`seq_id`),
  UNIQUE KEY `maker_code` (`maker_code`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;