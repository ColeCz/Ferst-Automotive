SELECT DISTINCT v.vin, v.vehicle_type, v.model_name, v.model_year, v.manufacturer, v.fuel_type, v.horsepower, v.description, STRING_AGG(c.color_name, ', ') AS colors, t.trans_date AS sale_date, t.trans_price AS sale_price
FROM Vehicle v
LEFT JOIN Color c ON v.vin = c.vin
JOIN Transaction t ON v.vin = t.vehicle_vin
JOIN Sale s ON t.trans_id = s.transactions
WHERE 1=1
	AND (%(vehicle_type)s IS NULL OR v.vehicle_type = %(vehicle_type)s)
	AND (%(manufacturer)s IS NULL OR v.manufacturer = %(manufacturer)s)
	AND (%(year)s IS NULL OR v.model_year = %(year)s)
GROUP BY v.vin, v.vehicle_type, v.model_name, v.model_year, v.manufacturer, v.fuel_type, v.horsepower, v.description, t.trans_date, t.trans_price;
