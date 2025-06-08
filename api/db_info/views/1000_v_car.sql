CREATE OR REPLACE VIEW v_car AS
SELECT c.*, e.entity_name, m.maker_name, y.year_name, cl.color_name, ct.category_name FROM car c JOIN master_entity e ON c.entity_code = e.entity_code LEFT JOIN master_maker m ON c.maker = m.maker_code
LEFT JOIN master_year y ON c.car_year = y.year_code LEFT JOIN master_color cl ON c.color = cl.color_code
LEFT JOIN master_category ct ON c.category = ct.category_code;