SELECT
	s.salesperson,
	COUNT(s.transactions) AS vehicles_sold,
	SUM(t.trans_price) AS total_sales_amount
FROM Sale s
JOIN Transaction t ON s.transactions = t.trans_id
WHERE EXTRACT(YEAR FROM t.trans_date) = $(year)s
AND EXTRACT(MONTH FROM t.trans_date) = $(month)s
GROUP BY s.salesperson
ORDER BY vehicles_sold DESC, total_sales_amount DESC;
