SELECT COUNT(DISTINCT v.vin) AS vehicles_with_uninstalled_parts
FROM Vehicle v
JOIN Part p ON v.vin = p.vehicle_vin
WHERE p.current_status IN ('ORDERED', 'RECEIVED');
