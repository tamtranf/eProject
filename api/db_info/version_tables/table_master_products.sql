CREATE TABLE IF NOT EXISTS `master_products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prod_name` varchar(256) NOT NULL,
  `prod_code` varchar(256) NOT NULL,
  `prod_color` varchar(32) NOT NULL,
  `notes` varchar(1024) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;