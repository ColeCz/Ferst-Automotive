WITH vehicle_inventory_times AS (
    SELECT 
        v.vehicle_type, 
        v.vin, 
        pt.trans_date AS purchase_date, 
        st.trans_date AS sale_date
    FROM vehicle v
    LEFT JOIN transaction pt ON v.vin = pt.vehicle_vin AND pt.trans_date IS NOT NULL
    LEFT JOIN transaction st ON v.vin = st.vehicle_vin AND st.trans_date > pt.trans_date
)
SELECT 
    vehicle_type,
    -- If no vehicles were sold, return NULL (to be handled as 'N/A' later)
    CASE
        WHEN COUNT(vin) = 0 THEN NULL  -- No sales, NULL will indicate this
        ELSE ROUND(AVG(
            CASE 
                WHEN sale_date IS NOT NULL AND purchase_date IS NOT NULL THEN
                    EXTRACT(DAY FROM sale_date - purchase_date) + 1  -- Adding 1 to include both the first and last day
                ELSE NULL  -- Skip vehicles with missing dates
            END
        ))
    END AS average_inventory_days,
    COUNT(vin) AS vehicles_sold
FROM vehicle_inventory_times
GROUP BY vehicle_type
ORDER BY vehicle_type;

