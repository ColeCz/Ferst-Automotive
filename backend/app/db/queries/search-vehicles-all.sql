SELECT DISTINCT v.vin, v.vehicle_type, v.model_name, v.model_year, v.manufacturer, v.fuel_type, v.horsepower, v.description, STRING_AGG(c.color_name, ', ') AS colors, t.trans_id, 
CASE
		WHEN t.trans_id IS NOT NULL THEN 'Sold'
		ELSE 'Available'
END AS sale_status, 
t.trans_date, t.trans_price
FROM Vehicle v
LEFT JOIN Color c ON v.vin = c.vin
LEFT JOIN Transaction t ON v.vin = t.vehicle_vin
WHERE 1=1
AND (%(vehicle_type)s IS NULL OR v.vehicle_type = %(vehicle_type)s)
AND (%(manufacturer)s IS NULL OR v.manufacturer = %(manufacturer)s)
AND (%(year)s IS NULL OR v.model_year = %(year)s)
AND (%(fuel_type)s IS NULL OR v.fuel_type = %(fuel_type)s)
AND (%(vin)s IS NULL OR v.vin = %(vin)s)
AND (%(description)s IS NULL OR v.description ILIKE '%' || %(description || '%') --TODO not sure how to put the or in the correct syntax
GROUP BY v.vin, v.vehicle_type, v.model_name, v.model_year, 
         v.manufacturer, v.fuel_type, v.horsepower, v.description,
         t.trans_id, t.trans_date, t.trans_price;
