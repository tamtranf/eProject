CREATE OR REPLACE VIEW v_order AS SELECT oc.*, c.maker, c.model, c.license_plate, c.car_year, c.color, c.passenger, c.category, c.weight, c.price_per_day as car_price,
c.status as car_status, c.notes as car_notes, c.maker_name, c.year_name, c.color_name, c.category_name, cu.customer_name, cu.phone_number, cu.postal_code, cu.address,
cu.created_date, cu.notes as customer_notes, u.full_name FROM order_control oc LEFT JOIN v_car c on c.code_id = oc.car_code_id LEFT JOIN customer cu on cu.customer_id
= oc.customer_id LEFT JOIN master_user u ON u.user_name = oc.incharge_user_name;