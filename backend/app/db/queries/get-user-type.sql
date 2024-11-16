WITH user_roles AS (
	SELECT
		username,
		CASE
			WHEN EXISTS(SELECT 1 FROM Clerk WHERE username = $(username)s) THEN 'Clerk'
			WHEN EXISTS(SELECT 1 FROM Salesperson WHERE username = $(username)s) THEN 'Salesperson'
			WHEN EXISTS(SELECT 1 FROM Manager WHERE username = $(username)s) THEN 'Manager'
		END AS role
	FROM Employee
WHERE username = $(username)s
)`
SELECT username, role
FROM user_roles
WHERE username = $(username)s;
