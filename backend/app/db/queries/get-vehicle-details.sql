SELECT v.vin, v.vehicle_type, v.model_name, v.model_year, v.manufacturer, v.fuel_type, v.horsepower, v.description, c.color_name, v.image_url,
    CASE
        WHEN s.transactions IS NOT NULL THEN 'Sold'
        ELSE 'Available'
    END AS sale_status
FROM Vehicle v
LEFT JOIN Color c ON v.vin = c.vin
LEFT JOIN transaction t ON v.vin = t.vehicle_vin
LEFT JOIN Sale s ON t.trans_id = s.transactions
WHERE v.vin = %(vin)s;