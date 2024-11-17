WITH seller_info AS (
SELECT c.customer_id, i.firstname || ' ' || i.lastname AS seller_name, 'Individual' AS seller_type
FROM Customer c
JOIN Individual i ON c.customer_id = i.customer_id

UNION ALL

SELECT c.customer_id, b.business_name AS seller_name, 'Business' AS seller_type
FROM Customer c
JOIN Business b ON c.customer_id = b.customer_id
),
seller_metrics AS (
	SELECT c.customer_id, COUNT(DISTINCT t.vehicle_vin) AS total_vehicles_sold, AVG(t.trans_price) AS avg_purchase_price, COUNT(p.order_number) / COUNT(DISTINCT t.vehicle_vin) AS cost_per_vehicle
	FROM Customer c
	JOIN Transaction t ON c.customer_id = t.customer
	LEFT JOIN PartOrder po ON t.vehicle_vin = po.vehicle_vin
	LEFT JOIN Part p ON po.order_number = p.order_number
	GROUP BY c.customer_id
)
SELECT
	si.seller_name, si.seller_type, sm.total_vehicles_sold, sm.avg_purchase_price, sm.parts_per_vehicle, sm.cost_per_vehicle, CASE
	WHEN sm.parts_per_vehicle > 5 OR sm.cost_per_vehicle > 500 THEN true
	ELSE false
END AS flagged
FROM seller_info si
JOIN seller_metrics sm ON si.customer_id = sm.customer_id
ORDER BY sm.total_vehicles_sold DESC, sm.avg_purchase_price ASC;
