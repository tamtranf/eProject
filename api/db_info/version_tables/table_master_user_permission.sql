CREATE TABLE IF NOT EXISTS `master_user_permission` (
  `seq_id` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(64) NOT NULL,
  `entity_code` varchar(32) NOT NULL,
  PRIMARY KEY (`seq_id`),
  UNIQUE KEY `user_name` (`user_name`, `entity_code`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;