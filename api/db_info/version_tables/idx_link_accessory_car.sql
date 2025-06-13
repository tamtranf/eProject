ALTER TABLE `link_accessory_car` ADD INDEX `accessory_code_id` USING BTREE(`accessory_code_id`);
ALTER TABLE `link_accessory_car` ADD UNIQUE INDEX `car_code_id` USING BTREE(`car_code_id`, `accessory_code_id`);
ALTER TABLE `link_accessory_car` ADD PRIMARY KEY USING BTREE(`seq_id`);
ALTER TABLE `link_accessory_car` MODIFY COLUMN `seq_id` INTEGER) UNSIGNED NOT NULL AUTO_INCREMENT;
