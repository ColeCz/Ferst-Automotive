WITH seller_info AS (
    -- Fetch individual sellers
    SELECT c.customer_id, i.firstname || ' ' || i.lastname AS seller_name, 'Individual' AS seller_type
    FROM Customer c
    JOIN Individual i ON c.customer_id = i.customer_id

    UNION ALL

    -- Fetch business sellers
    SELECT c.customer_id, b.business_name AS seller_name, 'Business' AS seller_type
    FROM Customer c
    JOIN Business b ON c.customer_id = b.customer_id
),
seller_metrics AS (
    -- Aggregate seller metrics: vehicles sold, average purchase price, and cost per vehicle
    SELECT 
        c.customer_id, 
        COUNT(DISTINCT t.vehicle_vin) AS total_vehicles_sold, 
        -- Return NULL if no transactions exist
        AVG(t.trans_price) AS avg_purchase_price,
        -- Safely calculate cost_per_vehicle, avoid division by zero
        CASE
            WHEN COUNT(DISTINCT t.vehicle_vin) > 0 THEN COUNT(p.order_number) / COUNT(DISTINCT t.vehicle_vin)
            ELSE NULL
        END AS cost_per_vehicle
    FROM Customer c
    LEFT JOIN Transaction t ON c.customer_id = t.customer  -- Use LEFT JOIN to include sellers with no transactions
    LEFT JOIN PartOrder po ON t.vehicle_vin = po.vehicle_vin  -- Ensure the join uses proper vehicle_vin
    LEFT JOIN Part p ON po.order_number = p.order_number  -- Join to the parts table
    GROUP BY c.customer_id
)
SELECT
    si.seller_name, 
    si.seller_type, 
    sm.total_vehicles_sold, 
    -- If no purchase price, return NULL
    COALESCE(ROUND(sm.avg_purchase_price, 2), NULL) AS avg_purchase_price,
    -- If no cost per vehicle, return NULL
    COALESCE(ROUND(sm.avg_purchase_price, 2), NULL) AS cost_per_vehicle,
    CASE
        WHEN sm.cost_per_vehicle > 500 THEN true  -- Flag if cost_per_vehicle is greater than 500
        ELSE false
    END AS flagged
FROM seller_info si
JOIN seller_metrics sm ON si.customer_id = sm.customer_id
ORDER BY sm.total_vehicles_sold DESC, sm.avg_purchase_price ASC;
