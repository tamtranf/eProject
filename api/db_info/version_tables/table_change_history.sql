CREATE TABLE IF NOT EXISTS `change_history` (
  `seq_id` int NOT NULL AUTO_INCREMENT,
  `change_time` datetime NOT NULL,
  `user_name` varchar(64) NOT NULL,
  `ref_table` varchar(64) NOT NULL,
  `ref_id` varchar(64) NOT NULL,
  `mode` tinyint NOT NULL,
  `old_data` text,
  `new_data` text,
  PRIMARY KEY (`seq_id`),
  KEY `ref_table` (`ref_table`, `ref_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;