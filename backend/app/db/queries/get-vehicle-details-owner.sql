SELECT v.vin, v.vehicle_type, v.model_name, v.model_year, v.manufacturer, v.description,
       pt.trans_date AS purchase_date, pt.trans_price AS purchase_price,
       p.condition AS purchase_condition,
       CONCAT(pc.first_name, ' ', pc.last_name) AS purchasing_clerk,
       st.trans_date AS sale_date, st.trans_price AS sale_price,
       CONCAT(sp.first_name, ' ', sp.last_name) AS selling_salesperson,
       CASE WHEN st.trans_id IS NULL THEN true ELSE false END AS can_modify
FROM Vehicle v
LEFT JOIN transaction pt ON v.vin = pt.vehicle_vin
LEFT JOIN Purchase p ON pt.trans_id = p.transactions
LEFT JOIN Clerk pc ON p.clerk = pc.username
LEFT JOIN transaction st ON v.vin = st.vehicle_vin
LEFT JOIN Sale s ON st.trans_id = s.transactions
LEFT JOIN Salesperson sp ON s.salesperson = sp.username
WHERE v.vin = $1
  AND (
      pc.username = owner OR
      sp.username = owner OR
      EXISTS (SELECT 1 FROM Manager m WHERE m.username = owner)