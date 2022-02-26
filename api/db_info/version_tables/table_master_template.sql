CREATE TABLE IF NOT EXISTS `master_template` (
  `seq_id` int NOT NULL AUTO_INCREMENT,
  `test_field_1` varchar(64) NOT NULL,
  `test_field_2` varchar(128) NOT NULL,
  `select_field_1` varchar(8) NOT NULL,
  PRIMARY KEY (`seq_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;