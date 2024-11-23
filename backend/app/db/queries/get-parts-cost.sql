SELECT SUM(unit_price * quantity)
FROM part
WHERE vehicle_vin = %(vehicle_vin)s;