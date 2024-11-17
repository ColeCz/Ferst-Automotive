WITH new_customer AS (
    INSERT INTO Customer (email, phone_num, postal_code, state_abbrv, city, street)
    VALUES (%(email)s, %(phone_num)s, %(postal_code)s, %(state_abbrv)s, %(city)s, %(street)s)
    RETURNING customer_id
)
INSERT INTO Individual (ssn, firstname, lastname, customer_id)
VALUES (%(ssn)s, %(firstname)s, %(lastname)s, (SELECT customer_id FROM new_customer));
