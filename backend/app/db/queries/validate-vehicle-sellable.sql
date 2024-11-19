SELECT v.vin, v.vehicle_type, v.model_name, v.model_year, v.manufacturer, v.fuel_type, v.horsepower, v.description,
    NOT EXISTS (
        SELECT 1
        FROM Part p
        JOIN PartOrder po ON p.vehicle_vin = po.vehicle_vin
            AND p.order_number = po.order_number
        WHERE po.vehicle_vin = v.vin
        AND p.current_status != 'INSTALLED'
    ) AS can_sell_vehicle
FROM Vehicle v
WHERE v.vin = %(vin)s;
