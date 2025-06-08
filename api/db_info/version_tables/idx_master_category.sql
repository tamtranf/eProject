ALTER TABLE `master_category` ADD UNIQUE INDEX `category_code` USING BTREE(`category_code`);
ALTER TABLE `master_category` ADD PRIMARY KEY USING BTREE(`seq_id`);
ALTER TABLE `master_category` MODIFY COLUMN `seq_id` INTEGER) UNSIGNED NOT NULL AUTO_INCREMENT;
