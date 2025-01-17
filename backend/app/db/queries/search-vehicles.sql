SELECT DISTINCT v.vin, v.vehicle_type, v.model_name, v.model_year, v.manufacturer, v.fuel_type, v.horsepower, v.description, v.image_url, STRING_AGG(c.color_name, ', ') AS colors
FROM Vehicle v
LEFT JOIN Color c 
    ON v.vin = c.vin
LEFT JOIN (
    SELECT t.vehicle_vin
    FROM Transaction t
    JOIN Sale s 
        ON t.trans_id = s.transactions
) sold 
    ON v.vin = sold.vehicle_vin
LEFT JOIN (
    SELECT vehicle_vin
    FROM Part
    WHERE current_status IN ('ORDERED', 'RECEIVED')
) pending_parts 
    ON v.vin = pending_parts.vehicle_vin
WHERE sold.vehicle_vin IS NULL
AND pending_parts.vehicle_vin IS NULL
AND (COALESCE(%(vin)s, '') = '' OR v.vin ILIKE %(vin)s)
AND (COALESCE(%(vehicle_type)s, '') = '' OR v.vehicle_type = %(vehicle_type)s)
AND (COALESCE(%(manufacturer)s, '') = '' OR v.manufacturer = %(manufacturer)s)
AND (COALESCE(%(year)s, '') = '' OR v.model_year = %(year)s)
AND (COALESCE(%(fuel_type)s, '') = '' OR v.fuel_type = %(fuel_type)s)
AND (COALESCE(%(keyword)s, '') = '' OR v.description ILIKE %(keyword)s)
AND (COALESCE(%(color)s, '') = '' OR EXISTS (
    SELECT 1 FROM Color c_sub
    WHERE c_sub.vin = v.vin AND c_sub.color_name = %(color)s
    ))
GROUP BY v.vin, v.vehicle_type, v.model_name, v.model_year, v.manufacturer, v.fuel_type, v.horsepower, v.description, v.image_url
ORDER BY v.vin ASC;
