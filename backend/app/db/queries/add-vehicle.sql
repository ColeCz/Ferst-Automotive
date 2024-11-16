INSERT INTO Vehicle (vin, vehicle_type, model_name, model_year, 
                    manufacturer, fuel_type, horsepower, description)
VALUES ($(vin)s, $(vehicle_type)s, $(model_name)s, $(model_year)s,
        $(manufacturer)s, $(fuel_type)s, $(horsepower)s, $(description)s);
