SELECT c.customer_id, c.email, c.phone_num, c.postal_code, c.state_abbrv,
       c.city, c.street, i.firstname, i.lastname, i.ssn
FROM Customer c
JOIN Individual i ON c.customer_id = i.customer_id
WHERE i.ssn = $(ssn)s;
