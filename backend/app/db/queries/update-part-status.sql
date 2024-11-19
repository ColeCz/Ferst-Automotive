SELECT p.part_number, p.part_description, p.vendor_number, p.current_status, p.unit_price, p.quantity, po.vendor, po.order_number
FROM Part p
JOIN PartOrder po ON p.vehicle_vin = po.vehicle_vin
    AND p.order_number = po.order_number
WHERE p.vehicle_vin = %(vin)s
ORDER BY p.part_number;
