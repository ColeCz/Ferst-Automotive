SELECT DISTINCT v.vin, v.vehicle_type, v.model_name, v.model_year,
       v.manufacturer, v.fuel_type, v.horsepower, v.description,
       STRING_AGG(c.color_name, ', ') as colors
FROM Vehicle v
LEFT JOIN Color c ON v.vin = c.vin
LEFT JOIN (
    SELECT t.vehicle_vin
    FROM Transaction t
    JOIN Sale s ON t.trans_id = s.transactions
) sold ON v.vin = sold.vehicle_vin
LEFT JOIN (
    SELECT vehicle_vin
    FROM Part
    WHERE current_status IN ('ORDERED', 'RECEIVED') -- capitalized to match schema
) pending_parts ON v.vin = pending_parts.vehicle_vin
WHERE sold.vehicle_vin IS NULL
AND pending_parts.vehicle_vin IS NULL
AND (%(vehicle_type)s IS NULL OR v.vehicle_type = %(vehicle_type)s)
AND (%(vehicle_type)s IS NULL OR v.manufacturer = %(manufacturer)s)
AND (%(year)s IS NULL OR v.model_year = %(year)s)
AND (%(fuel_type)s IS NULL OR v.fuel_type = %(fuel_type)s)
AND (%(color)s IS NULL OR EXISTS (
    SELECT 1 FROM Color
    WHERE vin = v.vin AND color_name = %(color)
))
AND (%(input)s IS NULL OR
    v.description ILIKE '%' || %(input)s || '%' OR
    v.model_name ILIKE '%' || %(input)s || '%')
GROUP BY v.vin, v.vehicle_type, v.model_name, v.model_year,
         v.manufacturer, v.fuel_type, v.horsepower, v.description;
