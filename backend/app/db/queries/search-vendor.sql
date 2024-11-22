SELECT vendor_name, phone_num, street, city, state_abbrv, postal_code
FROM vendor
WHERE vendor_name LIKE '%' || %(vendor_search_name)s || '%';