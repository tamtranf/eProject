CREATE TABLE IF NOT EXISTS `master_template` (
  `seq_id` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(256) DEFAULT NULL,
  `maker` varchar(64) DEFAULT NULL,
  `car` varchar(256) DEFAULT NULL,
  `user_password` varchar(64) DEFAULT NULL,
  `retrieve_date_time` datetime DEFAULT NULL,
  `return_date` date DEFAULT NULL,
  PRIMARY KEY (`seq_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;