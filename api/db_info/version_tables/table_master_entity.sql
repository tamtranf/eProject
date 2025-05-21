CREATE TABLE IF NOT EXISTS `master_entity` (
  `seq_id` int NOT NULL AUTO_INCREMENT,
  `entity_code` varchar(32) NOT NULL,
  `entity_name` varchar(64) NOT NULL,
  PRIMARY KEY (`seq_id`),
  UNIQUE KEY `entity_code` (`entity_code`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb3;