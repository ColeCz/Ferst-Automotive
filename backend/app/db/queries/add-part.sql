INSERT INTO Part (part_number, vehicle_vin, order_number, current_status, unit_price, part_description, quantity)
VALUES (%(part_number)s, %(vehicle_vin)s, %(order_num)s, 'ORDERED', %(unit_price)s, %(part_description)s, %(quantity)s);
