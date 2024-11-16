SELECT
	COUNT(DISTINCT t.trans_id) AS total_vehicles_sold,
	SUM(t.trans_price) AS total_gross_income,
	SUM(t.trans_price - COALESCE(p.trans_price, 0)) AS total_net_income
FROM Transaction t
JOIN Sale s ON t.trans_id = s.transactions
LEFT JOIN (
	SELECT trans_id, trans_price
	FROM Transaction t2
	JOIN Purchase p2 ON t2.trans_id = p2.transactions
) p ON t.vehicle_vin = (
	SELECT t3.vehicle_vin
	FROM Transaction t3
	WHERE t3.trans_id = p.trans_id
)
WHERE EXTRACT(MONTH FROM t.trans_date) = $month
AND EXTRACT(YEAR FROM t.trans_date) = $year;
