CREATE TABLE IF NOT EXISTS `master_test` (
  `seq_id` int NOT NULL AUTO_INCREMENT,
  `test_field` varchar(512) DEFAULT NULL,
  `test_number` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`seq_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;