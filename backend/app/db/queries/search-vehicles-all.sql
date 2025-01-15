SELECT DISTINCT v.vin, v.vehicle_type, v.model_name, v.model_year, 
       v.manufacturer, v.fuel_type, v.horsepower, v.description, 
       STRING_AGG(c.color_name, ', ') AS colors, 
       MAX(t.trans_id) AS trans_id,
       CASE
           WHEN MAX(t.trans_id) IS NOT NULL THEN 'Sold'
           ELSE 'Available'
       END AS sale_status,
       MAX(t.trans_date) AS trans_date, 
       MAX(t.trans_price) AS trans_price
FROM Vehicle v
LEFT JOIN Color c ON v.vin = c.vin
LEFT JOIN Transaction t ON v.vin = t.vehicle_vin
WHERE 1=1
AND (COALESCE(%(vehicle_type)s, '') = '' OR v.vehicle_type = %(vehicle_type)s)
AND (COALESCE(%(manufacturer)s, '') = '' OR v.manufacturer = %(manufacturer)s)
AND (COALESCE(%(year)s, '') = '' OR v.model_year = %(year)s)
AND (COALESCE(%(fuel_type)s, '') = '' OR v.fuel_type = %(fuel_type)s)
AND (COALESCE(%(vin)s, '') = '' OR v.vin ILIKE %(vin)s)
AND (COALESCE(%(keyword)s, '') = '' OR v.description ILIKE %(keyword)s) 
AND (COALESCE(%(color)s, '') = '' OR EXISTS (
    SELECT 1
    FROM Color c_sub
    WHERE c_sub.vin = v.vin AND c_sub.color_name = %(color)s
))
GROUP BY v.vin, v.vehicle_type, v.model_name, v.model_year, 
         v.manufacturer, v.fuel_type, v.horsepower, v.description
ORDER BY v.vin ASC;