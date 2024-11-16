WITH vehicle_inventory_times AS (
    SELECT v.vehicle_type,v.vin, p.transactions as purchase_id, s.transactions as sale_id, pt.trans_date as purchase_date, st.trans_date as sale_date,
        CASE
            WHEN st.trans_date IS NOT NULL THEN
                CASE
                    WHEN st.trans_date = pt.trans_date THEN 1
                    ELSE EXTRACT(DAY FROM (st.trans_date - pt.trans_date))
                END
            ELSE NULL
        END as inventory_days
    FROM Vehicle v
    JOIN Transaction pt ON v.vin = pt.vehicle_vin
    JOIN Purchase p ON pt.trans_id = p.transactions
    LEFT JOIN Transaction st ON v.vin = st.vehicle_vin
    LEFT JOIN Sale s ON st.trans_id = s.transactions
    WHERE s.transactions IS NOT NULL  -- Only include sold vehicles
)
SELECT
vehicle_type
	ROUND(AVG(inventory_days)) AS average_inventory_days,
   	COUNT(*) AS vehicles_sold
FROM vehicle_inventory_times
GROUP BY vehicle_type
ORDER BY vehicle_type;
