SELECT vendor_name, phone_num, street, city, state_abbrv, postal_code
FROM Vendor
WHERE vendor_name = %(vendor_name)s;
