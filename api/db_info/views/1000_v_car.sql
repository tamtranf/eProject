 CREATE OR REPLACE VIEW v_car AS SELECT c.*, e.entity_name  FROM car c JOIN master_entity e ON c.entity_code = 
e.entity_code;