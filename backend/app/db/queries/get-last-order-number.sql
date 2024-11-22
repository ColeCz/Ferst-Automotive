SELECT MAX(order_number)
FROM partorder
WHERE vehicle_vin = %(vehicle_vin)s;
