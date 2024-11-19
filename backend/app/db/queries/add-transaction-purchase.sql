WITH new_transaction AS (
	INSERT INTO Transaction (trans_date, trans_price, customer, vehicle_vin)
	VALUES (CURRENT_TIMESTAMP, %(sale_price)s, %(customer_id)s, %(vehicle_vin)s)
	RETURNING trans_id
)
INSERT INTO Purchase (transactions, clerk, condition)
VALUES (
	(SELECT trans_id FROM new_transaction),
	%(current_clerk+_name)s,
    %(condition)s
);