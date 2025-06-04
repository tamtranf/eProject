CREATE OR REPLACE VIEW v_master_user_permission AS 
SELECT p.*, u.full_name, e.entity_name FROM master_user_permission p 
JOIN master_user u ON u.user_name = p.user_name
 JOIN master_entity e ON e.entity_code = p.entity_code;