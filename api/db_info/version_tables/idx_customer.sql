ALTER TABLE `customer` ADD INDEX `created_date` USING BTREE(`created_date`);
ALTER TABLE `customer` ADD UNIQUE INDEX `customer_id` USING BTREE(`customer_id`);
ALTER TABLE `customer` ADD INDEX `customer_name` USING BTREE(`customer_name`);
ALTER TABLE `customer` ADD PRIMARY KEY USING BTREE(`seq_id`);
ALTER TABLE `customer` MODIFY COLUMN `seq_id` INTEGER) UNSIGNED NOT NULL AUTO_INCREMENT;
