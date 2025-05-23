CREATE TABLE IF NOT EXISTS `master_user` (
  `seq_id` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(64) NOT NULL,
  `password` varchar(64) NOT NULL,
  `full_name` varchar(256) NOT NULL,
  `last_login` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` tinyint NOT NULL DEFAULT '1',
  `is_super_admin` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`seq_id`),
  UNIQUE KEY `user_name` (`user_name`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;