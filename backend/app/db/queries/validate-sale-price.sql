SELECT v.vin, v.model_name, v.model_year, v.manufacturer
FROM Vehicle v
LEFT JOIN (
Sale s
	JOIN Transactions t ON s.transactions = t.trans_id
) ON t.vehicle_vin = v.vin
WHERE v.vin = $(vin)s
	AND t.trans_id IS NULL;
