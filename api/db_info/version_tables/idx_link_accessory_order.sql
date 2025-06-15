ALTER TABLE `link_accessory_order` ADD INDEX `accessory_code_id` USING BTREE(`accessory_code_id`);
ALTER TABLE `link_accessory_order` ADD INDEX `order_id` USING BTREE(`order_id`);
ALTER TABLE `link_accessory_order` ADD PRIMARY KEY USING BTREE(`seq_id`);
ALTER TABLE `link_accessory_order` MODIFY COLUMN `seq_id` INTEGER) UNSIGNED NOT NULL AUTO_INCREMENT;
