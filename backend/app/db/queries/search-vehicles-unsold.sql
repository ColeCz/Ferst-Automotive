SELECT DISTINCT v.vin, v.vehicle_type, v.model_name, v.model_year, v.manufacturer, v.fuel_type, v.horsepower, v.description,
                STRING_AGG(c.color_name, ', ') AS colors
FROM Vehicle v
LEFT JOIN Color c ON v.vin = c.vin
LEFT JOIN Transaction t ON v.vin = t.vehicle_vin
WHERE 1=1
AND (COALESCE(%(vin)s, '') = '' OR v.vin = %(vin)s)
AND (COALESCE(%(vehicle_type)s, '') = '' OR v.vehicle_type = %(vehicle_type)s)
AND (COALESCE(%(manufacturer)s, '') = '' OR v.manufacturer = %(manufacturer)s)
AND (COALESCE(%(year)s, '') = '' OR v.model_year = %(year)s)
AND (COALESCE(%(fuel_type)s, '') = '' OR v.fuel_type = %(fuel_type)s)
AND (COALESCE(%(input)s, '') = '' OR v.description ILIKE %(input)s)
AND t.trans_id IS NULL -- Only get unsold vehicles
GROUP BY v.vin, v.vehicle_type, v.model_name, v.model_year, v.manufacturer, v.fuel_type, v.horsepower, v.description;
