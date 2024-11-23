CREATE USER dealership WITH PASSWORD 'dealership';
ALTER user dealership WITH superuser;
CREATE DATABASE dealership WITH OWNER = dealership TABLESPACE = pg_default CONNECTION LIMIT = -1;