SELECT v.vin, v.vehicle_type, v.model_name, v.model_year, v.manufacturer, v.fuel_type, v.horsepower, v.description,
    -- Purchase info
    pt.trans_date AS purchase_date, pt.trans_price AS purchase_price, p.condition AS purchase_condition, pc.username AS purchasing_clerk,
    -- Parts info
    part.part_number, part.part_description, part.current_status AS part_status, part.unit_price AS part_price, part.quantity AS part_quantity, po.vendor AS part_vendor,
    -- Calculating total parts cost
    SUM(part.unit_price * part.quantity) AS total_parts_cost,
    -- Sale info if sold
    st.trans_date AS sale_date, st.trans_price AS sale_price, s.salesperson AS selling_salesperson,
    -- Seller's contact info
    c.email AS seller_email, c.phone_num AS seller_phone, c.postal_code AS seller_postal_code,
    c.state_abbrv AS seller_state, c.city AS seller_city, c.street AS seller_street
FROM Vehicle v
LEFT JOIN transaction pt ON v.vin = pt.vehicle_vin
LEFT JOIN Purchase p ON pt.trans_id = p.transactions
LEFT JOIN Clerk pc ON p.clerk = pc.username
LEFT JOIN PartOrder po ON v.vin = po.vehicle_vin
LEFT JOIN Part part ON po.vehicle_vin = part.vehicle_vin AND po.order_number = part.order_number
LEFT JOIN transaction st ON v.vin = st.vehicle_vin
LEFT JOIN Sale s ON st.trans_id = s.transactions
LEFT JOIN Customer c ON pt.customer = c.customer_id -- Join to get the seller info
WHERE v.vin = %(vin)s
GROUP BY v.vin, pt.trans_date, pt.trans_price, p.condition, pc.username, part.part_number, part.part_description, part.current_status, part.unit_price, part.quantity, po.vendor, st.trans_date, st.trans_price, s.salesperson, c.email, c.phone_num, c.postal_code, c.state_abbrv, c.city, c.street;

