-- Define a list of conditions to ensure all possible conditions are included in the result
WITH condition_list AS (
    -- The unnest function creates a list of conditions: 'Excellent', 'Very Good', 'Good', 'Fair'
    SELECT unnest(ARRAY['Excellent', 'Very Good', 'Good', 'Fair']) AS condition
),
-- Define a list of distinct vehicle types from the vehicle table
vehicle_type_list AS (
    -- Retrieve distinct vehicle types from the vehicle table
    SELECT DISTINCT vehicle_type FROM public.vehicle
)

-- Main query to calculate the average price per vehicle type and condition
SELECT 
    -- Select the vehicle type from the vehicle_type_list
    v.vehicle_type, 
    
    -- Select the condition from the condition_list
    c.condition,
    
    -- Calculate the average price of transactions for each vehicle type and condition
    -- If no transaction is found, use COALESCE to return 0 as the average price
    COALESCE(ROUND(AVG(CASE WHEN p.condition = c.condition THEN t.trans_price END), 2), 0) AS avg_price

FROM 
    -- Use the vehicle_type_list (which contains distinct vehicle types) for the vehicle_type
    vehicle_type_list v

-- Use CROSS JOIN to combine each vehicle type with every condition
-- This ensures that all combinations of vehicle types and conditions are considered
CROSS JOIN 
    condition_list c

-- Left join to the transaction table to get transaction data for each vehicle
LEFT JOIN 
    public.transaction t ON t.vehicle_vin IN (SELECT vin FROM public.vehicle WHERE vehicle_type = v.vehicle_type)

-- Left join to the purchase table to get the purchase details matching both transaction ID and condition
LEFT JOIN 
    public.purchase p ON p.transactions = t.trans_id

-- Group the results by vehicle type and condition to calculate the average price for each combination
GROUP BY 
    v.vehicle_type, c.condition

-- Order the results by vehicle type and condition for better readability
ORDER BY 
    v.vehicle_type, c.condition;
