SELECT COUNT(DISTINCT v.vin) AS available_vehicles
FROM Vehicle v
LEFT JOIN (
	SELECT t.vehicle_vin
	FROM Transaction t
	JOIN Sale s ON t.trans_id = s.transactions
) sold ON v.vin = sold.vehicle_vin
WHERE sold.vehicle_vin IS NULL
	AND NOT EXISTS (
		SELECT 1
		FROM Parts p
		WHERE p.vehicle_vin = v.vin
			AND p.current_status IN ('ORDERED', 'RECEIVED') --renamed status to current_status and capitalized ORDERED and RECEIVED
	);