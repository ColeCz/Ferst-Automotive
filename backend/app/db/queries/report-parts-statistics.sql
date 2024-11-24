SELECT
v.vendor_name,
SUM(p.quantity) as total_parts_supplied,
SUM(p.unit_price * p.quantity) AS total_spent
FROM Vendor v
JOIN PartOrder po ON v.vendor_name = po.vendor
JOIN Part p ON po.order_number = p.order_number AND po.vehicle_vin = p.vehicle_vin
GROUP BY v.vendor_name
ORDER BY total_spent DESC;
