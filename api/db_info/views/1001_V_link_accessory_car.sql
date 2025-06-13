CREATE OR REPLACE VIEW v_link_accessory_car AS
SELECT 
    l.*, 
    c.maker, 
    c.model, 
    c.code_id, 
    c.license_plate, 
    c.car_year, 
    c.color, 
    c.passenger, 
    c.category, 
    c.weight, 
    c.price_per_day, 
    c.status, 
    c.notes, 
    c.entity_code, 
    c.entity_name, 
    c.maker_name, 
    c.year_name, 
    c.color_name, 
    c.category_name
FROM 
    link_accessory_car l
JOIN 
    v_car c 
    ON c.code_id = l.car_code_id;
