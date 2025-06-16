 CREATE OR REPLACE VIEW v_link_accessory_order AS SELECT l.*, a.category, a.code_id, a.name, a.color, a.notes FROM link_accessory_order l LEFT JOIN accessory a ON 
a.code_id = l.accessory_code_id;