SELECT
	t.trans_id,
	t.trans_date,
	t.trans_price,
	t.customer,
	t.vehicle_vin,
	CASE
		WHEN p.transactions IS NOT NULL THEN 'PURCHASE'
		WHEN s.transactions IS NOT NULL THEN 'SALE'
	END AS type,
	p.clerk,
	p.condition,
	s.salesperson
FROM
	Transaction t
LEFT OUTER JOIN
	Purchase p
ON
	p.transactions = t.trans_id
LEFT OUTER JOIN
	Sale s
ON
	s.transactions = t.trans_id
WHERE
	t.trans_id = %(trans_id)s
