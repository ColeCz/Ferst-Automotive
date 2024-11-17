INSERT INTO Part (part_number, vehicle_vin, order_number, current_status, vendor_number, unit_price, part_description, quantity)
VALUES (%(part_number)s, %(vehicle_vin)s, %(order_num)s, 'ORDERED', %(vendor_number)s, %(unit_price)s, %(part_description)s, %(quantity)s);
