SELECT  v.vin, v.vehicle_type, v.model_name, v.model_year, v.manufacturer, v.fuel_type, v.horsepower, v.description, pt.trans_date AS purchase_date, pt.trans_price AS purchase_price, p.condition AS purchase_condition, pc.username AS purchasing_clerk, part.part_number, part.part_description, part.current_status AS part_status, part.unit_price AS part_price, part.quantity AS part_quantity, po.vendor AS part_vendor, po.order_number, st.trans_date AS sale_date, st.trans_price AS sale_price, s.salesperson AS selling_salesperson,
    -- Check if vehicle can be modified (not sold)
    CASE WHEN st.trans_id IS NULL THEN true ELSE false END AS can_modify
FROM Vehicle v
LEFT JOIN transaction pt ON v.vin = pt.vehicle_vin
LEFT JOIN Purchase p ON pt.trans_id = p.transactions
LEFT JOIN Clerk pc ON p.clerk = pc.username
LEFT JOIN PartOrder po ON v.vin = po.vehicle_vin
LEFT JOIN Part part ON po.vehicle_vin = part.vehicle_vin
    AND po.order_number = part.order_number
LEFT JOIN transaction st ON v.vin = st.vehicle_vin
LEFT JOIN Sale s ON st.trans_id = s.transactions
WHERE v.vin = %(vin);
-- Second query: Check if vehicle can be modified before any update
SELECT
    CASE WHEN NOT EXISTS (
        SELECT 1
        FROM transaction t
        JOIN Sale s ON t.trans_id = s.transactions
        WHERE t.vehicle_vin = %(vin)s
    ) THEN true ELSE false END AS can_modify;