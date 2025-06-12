CREATE OR REPLACE VIEW v_rent_history AS 
SELECT r.*, c.customer_name FROM `rent_history` r LEFT JOIN customer c ON c.customer_id = r.customer_id