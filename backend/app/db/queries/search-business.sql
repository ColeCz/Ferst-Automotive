SELECT c.customer_id, c.email, c.phone_num, c.postal_code, c.state_abbrv,
       c.city, c.street, b.business_name, b.title, b.firstname, b.lastname, b.tin
FROM Customer c
JOIN Business b ON c.customer_id = b.customer_id
WHERE b.tin = %(tin)s;
