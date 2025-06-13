ALTER TABLE `change_history` ADD PRIMARY KEY USING BTREE(`seq_id`);
ALTER TABLE `change_history` ADD INDEX `ref_table` USING BTREE(`ref_table`, `ref_id`);
ALTER TABLE `change_history` MODIFY COLUMN `seq_id` INTEGER) UNSIGNED NOT NULL AUTO_INCREMENT;
