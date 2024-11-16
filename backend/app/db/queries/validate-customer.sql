SELECT c.customer_id,
COALESCE(i.firstname || ' ' || i.lastname, b.business_name) AS seller_name
FROM Customer c
LEFT JOIN Individual i ON c.customer_id = i.customer_id
LEFT JOIN Business b ON c.customer_id = b.customer_id
WHERE c.customer_id = $(customer_id)s;
