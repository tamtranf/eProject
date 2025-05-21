ALTER TABLE `master_user_permission` ADD PRIMARY KEY USING BTREE(`seq_id`);
ALTER TABLE `master_user_permission` ADD UNIQUE INDEX `user_name` USING BTREE(`user_name`, `entity_code`);
ALTER TABLE `master_user_permission` MODIFY COLUMN `seq_id` INTEGER) UNSIGNED NOT NULL AUTO_INCREMENT;
