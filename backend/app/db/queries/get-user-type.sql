-- WITH user_roles AS (
-- 	SELECT
-- 		username,
-- 	    EXISTS(SELECT 1 FROM Clerk WHERE username = %(username)s) AS IsClerk,
-- 		EXISTS(SELECT 1 FROM Salesperson WHERE username = %(username)s) AS IsSalesperson,
-- 		EXISTS(SELECT 1 FROM Manager WHERE username = %(username)s) AS IsManager
-- 	FROM Employee
--     WHERE username = %(username)s
-- )
-- SELECT username, role
-- FROM user_roles
-- WHERE username = %(username)s;

SELECT
    username,
    (EXISTS(SELECT 1 FROM Clerk WHERE Clerk.username = Employee.username)) AS IsClerk,
    (EXISTS(SELECT 1 FROM Salesperson WHERE Salesperson.username = Employee.username)) AS IsSalesperson,
    (EXISTS(SELECT 1 FROM Manager WHERE Manager.username = Employee.username)) AS IsManager
FROM Employee
WHERE username = %(username)s;