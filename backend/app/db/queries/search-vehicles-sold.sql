SELECT DISTINCT v.vin, v.vehicle_type, v.model_name, v.model_year, v.manufacturer, v.fuel_type, v.horsepower, v.description, STRING_AGG(c.color_name, ', ') AS colors,t.trans_date AS sale_date, t.trans_price AS sale_price
FROM Vehicle v
LEFT JOIN Color c ON v.vin = c.vin
JOIN Transaction t ON v.vin = t.vehicle_vin
JOIN Sale s ON t.trans_id = s.transactions
WHERE 1=1
    AND (COALESCE(%(vin)s, '') = '' OR v.vin ILIKE %(vin)s)
    AND (COALESCE(%(vehicle_type)s, '') = '' OR v.vehicle_type = %(vehicle_type)s)
    AND (COALESCE(%(manufacturer)s, '') = '' OR v.manufacturer = %(manufacturer)s)
    AND (COALESCE(%(year)s, '') = '' OR v.model_year = %(year)s)
    AND (COALESCE(%(fuel_type)s, '') = '' OR v.fuel_type = %(fuel_type)s)
    AND (COALESCE(%(keyword)s, '') = '' OR v.description = %(keyword)s)
    AND (COALESCE(%(color)s, '') = '' OR EXISTS (
    SELECT 1
    FROM Color c_sub
    WHERE c_sub.vin = v.vin AND c_sub.color_name = %(color)s
))
GROUP BY v.vin, v.vehicle_type, v.model_name, v.model_year, v.manufacturer, v.fuel_type, v.horsepower, v.description, t.trans_date, t.trans_price
ORDER BY v.vin ASC;

