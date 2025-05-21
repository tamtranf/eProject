ALTER TABLE `master_entity` ADD UNIQUE INDEX `entity_code` USING BTREE(`entity_code`);
ALTER TABLE `master_entity` ADD PRIMARY KEY USING BTREE(`seq_id`);
ALTER TABLE `master_entity` MODIFY COLUMN `seq_id` INTEGER) UNSIGNED NOT NULL AUTO_INCREMENT;
