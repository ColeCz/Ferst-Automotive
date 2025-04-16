-- This program begins a transaction and generates 50k rows in the vehicle table, which allows for testing indexes at scale. Copy and paste into pgadmin's query tool to use

BEGIN TRANSACTION;

DO $$
DECLARE
    i INT;
    dummy_vin TEXT;
    years TEXT[] := ARRAY['2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010', '2011', '2012', '2013','2014','2015','2016','2017','2018','2019','2020','2021','2022','2023','2024'];
    manufacturers TEXT[] := ARRAY['Acura', 'FIAT', 'Lamborghini', 'Nio', 'Alfa Romeo', 'Ford', 'Land Rover', 'Porsche', 'Aston Martin', 'Geeley', 'Lexus', 'Ram', 'Audi', 'Lincoln', 'Rivian', 'Bentley', 'GMC', 'Lotus','BMW', 'Honda', 'Maserati', 'smart', 'Buick', 'Hyundai', 'MAZDA', 'Subaru', 'Cadillac', 'INFINITI', 'McLaren', 'Tesla', 'Chevrolet', 'Jaguar', 'Mercedes-Benz', 'Toyota', 'Chrysler', 'Jeep', 'MINI', 'Volkswagen', 'Dodge', 'Karma', 'Mitsubishi', 'Volvo', 'Ferrari', 'Kia', 'Nissan', 'XPeng'];
BEGIN
    FOR i IN 1..50000 LOOP

        dummy_vin := i::TEXT;

        INSERT INTO vehicle (vin, vehicle_type, model_name, model_year, manufacturer, fuel_type, horsepower, description)
        VALUES (
	        dummy_vin,
	        'SUV',      -- static/not tested currently
	        'BOXSTER',  -- static/not tested currently
	        years[(random() * (array_length(years, 1) - 1) + 1)::int],
            manufacturers[(random() * (array_length(manufacturers, 1) - 1) + 1)::int],
            'Gas',      -- static/not tested currently
	        1,          -- static/not tested currently
            'good car'  -- static/not tested currently
        );

	    INSERT INTO color (vin, color_name)
	    VALUES (
	        dummy_vin,
	        'Copper'
	    );

    END LOOP;

END $$;

-- ROLLBACK;    -- Note: will likely want to rollback transaction after running other queries
