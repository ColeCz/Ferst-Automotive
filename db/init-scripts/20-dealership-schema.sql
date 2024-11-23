\c dealership;

CREATE TABLE Customer
(
	customer_id SERIAL PRIMARY KEY,
	email       VARCHAR(64),
	phone_num   CHAR(10)    NOT NULL,
	postal_code CHAR(5)     NOT NULL,
	state_abbrv CHAR(2)     NOT NULL,
	city        VARCHAR(64) NOT NULL,
	street      VARCHAR(64) NOT NULL
);

CREATE TABLE Business
(
	tin           CHAR(10),
	business_name VARCHAR(64)                               NOT NULL,
	title         VARCHAR(64)                               NOT NULL,
	firstname     VARCHAR(64)                               NOT NULL,
	lastname      VARCHAR(64)                               NOT NULL,
	customer_id   INTEGER REFERENCES Customer (customer_id) NOT NULL,
	PRIMARY KEY (tin)
);

CREATE TABLE Individual
(
	ssn         CHAR(10),
	firstname   VARCHAR(64)                               NOT NULL,
	lastname    VARCHAR(64)                               NOT NULL,
	customer_id INTEGER REFERENCES Customer (customer_id) NOT NULL,
	PRIMARY KEY (ssn)
);

CREATE TABLE Employee
(
	username    VARCHAR(64) PRIMARY KEY,
	pass        VARCHAR(64),
	firstname   VARCHAR(64)                               NOT NULL,
	lastname    VARCHAR(64)                               NOT NULL
);

CREATE TABLE Salesperson
(
	username VARCHAR(64) REFERENCES Employee (username),
	PRIMARY KEY (username)
);

CREATE TABLE Clerk
(
	username VARCHAR(64) REFERENCES Employee (username),
	PRIMARY KEY (username)
);

CREATE TABLE Manager
(
	username VARCHAR(64) REFERENCES Employee (username),
	PRIMARY KEY (username)
);

CREATE TABLE VehicleType
(
	type_name VARCHAR(64) PRIMARY KEY
);

CREATE TABLE Manufacturer
(
	name VARCHAR(64) PRIMARY KEY
);

CREATE TABLE Vehicle
(
	vin          CHAR(17) PRIMARY KEY,
	vehicle_type VARCHAR(64)                                    NOT NULL REFERENCES VehicleType (type_name),
	model_name   VARCHAR(64)                                    NOT NULL,
	model_year   CHAR(4)                                        NOT NULL,
	manufacturer VARCHAR(64)                                    NOT NULL REFERENCES Manufacturer (name),
	fuel_type    VARCHAR(64) CHECK (fuel_type IN ('Gas', 'Diesel', 'Natural Gas', 'Hybrid', 'Plugin Hybrid', 'Battery',
												  'Fuel Cell')) NOT NULL,
	horsepower   INTEGER                                        NOT NULL,
	description  VARCHAR(256)
);

CREATE TABLE Color
(
	vin        CHAR(17) REFERENCES Vehicle (vin),
	color_name VARCHAR(64) CHECK (color_name IN
								  ('Aluminum', 'Beige', 'Black', 'Blue', 'Brown', 'Bronze', 'Claret', 'Copper', 'Cream',
								   'Gold', 'Gray', 'Green', 'Maroon', 'Metallic', 'Navy', 'Orange', 'Pink', 'Purple',
								   'Red', 'Rose', 'Rust', 'Silver', 'Tan', 'Turquoise', 'White', 'Yellow')) NOT NULL,
	PRIMARY KEY (vin, color_name)
);

CREATE TABLE Transaction
(
	trans_id    SERIAL PRIMARY KEY,
	trans_date  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	trans_price INTEGER   NOT NULL,
	customer    INTEGER REFERENCES Customer (customer_id),
	vehicle_vin CHAR(17) REFERENCES Vehicle (vin)
);

CREATE TABLE Purchase
(
	transactions INTEGER REFERENCES Transaction (trans_id) ON DELETE CASCADE,
	clerk        VARCHAR(64) REFERENCES Clerk (username)                                     NOT NULL,
	condition    VARCHAR(20) CHECK (condition IN ('Excellent', 'Very Good', 'Good', 'Fair')) NOT NULL,
	PRIMARY KEY (transactions)
);

CREATE TABLE Sale
(
	transactions INTEGER REFERENCES Transaction (trans_id) ON DELETE CASCADE,
	salesperson  VARCHAR(64) REFERENCES Salesperson (username) NOT NULL,
	PRIMARY KEY (transactions)
);

CREATE TABLE Vendor
(
	vendor_name VARCHAR(64) PRIMARY KEY,
	phone_num   VARCHAR(10) NOT NULL,
	street      VARCHAR(64) NOT NULL,
	city        VARCHAR(64) NOT NULL,
	state_abbrv VARCHAR(2)  NOT NULL,
	postal_code VARCHAR(5)  NOT NULL
);

CREATE TABLE PartOrder
(
	vehicle_vin  CHAR(17) REFERENCES Vehicle (vin),
	order_number VARCHAR(10)                                 NOT NULL,
	vendor       VARCHAR(64) REFERENCES Vendor (vendor_name) NOT NULL,
	PRIMARY KEY (vehicle_vin, order_number)
);

CREATE TABLE Part
(
	vehicle_vin      CHAR(17)                                                                   NOT NULL,
	order_number     VARCHAR(10)                                                                NOT NULL,
	part_number      VARCHAR(64)                                                                NOT NULL,
	current_status   VARCHAR(64) CHECK (current_status IN ('ORDERED', 'RECEIVED', 'INSTALLED')) NOT NULL,
	unit_price       INTEGER                                                                    NOT NULL,
	part_description VARCHAR(300)                                                               NOT NULL,
	quantity         INTEGER                                                                    NOT NULL,
	PRIMARY KEY (vehicle_vin, order_number, part_number),
	FOREIGN KEY (vehicle_vin, order_number) REFERENCES PartOrder (vehicle_vin, order_number)
);