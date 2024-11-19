--modified to be modeled after validate-ssn.sql
SELECT tid
FROM Business
WHERE tid = %(tid)s;
