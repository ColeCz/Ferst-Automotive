WITH new_transaction AS (
	INSERT INTO Transaction (trans_date, trans_price, customer, vehicle_vin)
	VALUES (CURRENT_TIMESTAMP, %(trans_price)s, %(customer)s, %(vehicle_vin)s)
	RETURNING trans_id
)
INSERT INTO Purchase (transactions, clerk, condition)
VALUES (
	(SELECT trans_id FROM new_transaction),
	%(clerk)s,
    %(condition)s
);