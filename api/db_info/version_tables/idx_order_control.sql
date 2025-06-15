ALTER TABLE `order_control` ADD INDEX `car_code_id` USING BTREE(`car_code_id`);
ALTER TABLE `order_control` ADD INDEX `customer_id` USING BTREE(`customer_id`);
ALTER TABLE `order_control` ADD INDEX `entity_code` USING BTREE(`entity_code`);
ALTER TABLE `order_control` ADD UNIQUE INDEX `order_id` USING BTREE(`order_id`);
ALTER TABLE `order_control` ADD PRIMARY KEY USING BTREE(`seq_id`);
ALTER TABLE `order_control` ADD INDEX `status` USING BTREE(`status`);
ALTER TABLE `order_control` MODIFY COLUMN `seq_id` INTEGER) UNSIGNED NOT NULL AUTO_INCREMENT;
