# Ferst Automotive – Car Dealership Management System

## Overview
Ferst Automotive is a fullstack car dealership web application designed for users to browse and purchase vehicles and for employees to manage vehicle inventory, transactions, parts, and reports statistics. Built with PostgreSQL, Flask, and React, it supports five different user roles and offers ultra-performant indexed scans on its large datasets. It is containerized with Docker and hosted with AWS EC2.

---

## Features

### Features for Customers and All Employees
- 🔒 **Role-based access control**: All user types have different functionalities and views, there are customers (buyer or seller type), clerks, salesemen, managers, and an owner
- 🚗 **Advanced vehicle search**: All users can search current vehicle inventory using 0-7 search parameters. The feature has role-based behaviour and is optimized with several indexes
- 🧾 **Vehicle details pages**: Provides things like image and description

### Salespeople Features
- 🚗 **Access to all vehicles**: Access to all sold and unsold vehicles to help with making sales or learning from past sales data, can use sold/unsold filter button
- 📊 **Vehicle sales statistics**: Can query the transactions table on month, year, vehicle condition, vehicle model, vehicle year, etc.

### Clerk Features
- 🚗 **Access to all unsold vehicles**:
- 🛠️ **Manage parts, parts orders, and repair status**: Full control over the vehicles in inventory

### Manager Features
- 💵 **Can approve sales**: Can approve sales for salesmen and customers
- 💳 **Can purchase vehicles**: Can purchase vehicles from seller type users

### Owner Features
- 👑 **Access to all other user permissions**: Total control over the app
- 🚗 **Advanced vehicle search**: Access to all sold and unsold vehicles and a filter button
- 📊 **Reports dashboard**: Sales, purchases, and revenue stats over time

---

## Using the App

### viewing live demo
- Route to [http://3.147.185.195:8080/login/](http://3.147.185.195:8080/login/) and use "owner" for the username and password (this role has access to all features)
- **Note:** I try to leave the server running when I have open job applications, but please feel free to reach out if the server is down.

### running the app locally
- Install docker on your machine 
- Clone repo
- Run "docker compose up -d --build" in the root project directory, it will automatically install requirements.txt, start and populate the db, then run the flask app and frontend. View at "http://localhost:8080/login/"
- pgadmin will be running on port 8082, and a backend test server will be running on 8081
- Usernames and passwords for different roles can be found in db/init-scripts/30-dealership-users.sql
- Run "docker compose down -v" to stop containers/application and clear volumes 

## Project Directory Layout <br>
<!-- <details> -->
<!-- <summary>📁 Click to expand project skeleton</summary> -->

```plaintext
├── backend/                      		# Backend Python app (Flask)
│   └── app/
│       ├── auth/                		# Authentication logic (login, roles)
│       ├── db/                  		# DB connection + SQL queries
│       │   └── queries/         		# 📄 40+ SQL files spanning many queries
│       ├── main/                		# Entrypoint routing
│       ├── part/                		# Part-related endpoints
│       ├── reports/             		# Reporting endpoints
│       ├── transaction/         		# Purchase/sale endpoints
│       ├── vehicle/             		# Vehicle API
│       ├── vehicle_details/    		# Vehicle detail API
│       └── vendor/              		# Vendor API
├── db/                          		# PostgreSQL setup scripts
│   ├── data-prep-scripts/       		# Python scripts to populate vehicle transaction data
│   ├── init-scripts/            		# Creates DB and DB user, adds seed data, runs raw SQL schema
│   └── query-optimization-scripts/ 	# SQL script to insert 50k vals and test indexes
├── frontend/                    	 	# React frontend (I did not do much with this, just some HTML)
│   ├── deployment/              		# NGINX config
│   ├── public/
│   │   └── images/              		# 🚗 Vehicle type images (Sedan.jpg, Truck.jpg, etc.)
│   └── src/
│       ├── components/
│       │   └── common/
│       │       ├── Header/
│       │       ├── Login/
│       │       ├── Logout/
│       │       ├── ProtectedElement/
│       │       └── ProtectedRoute/
│       ├── pages/
│       │   ├── AddPart/
│       │   ├── AddVehicle/
│       │   ├── HomePage/
│       │   ├── Reports/
│       │   ├── SellVehicle/
│       │   └── VehicleDetails/
│       └── utils/
└── relational-mapping-and-eer/        # 📊 Diagrams for EER and relational mapping

```
<!-- </details> -->


## My Contributions
- Designed the EER model for the 17-table DB with support from a backend engineer
- Wrote the relational mapping diagram for the DB
- Formulated the schema script based on the EER model and relational mapping, began RBAC at the schema level
- Developed multiple API endpoints, including the advanced vehicle search with 0-7 search parameters, a filter, and application-level RBAC
- Optimized the vehicle search with strategic indexing, allowing query speed increases with minimal space tradeoff
- Wrote a SQL script to mass-populate the vehicles table to test indexing, allowing me to document speed increases of up to 157x. The script is wrapped in a transaction to rollback the inserts after testing, and you can view the results in the query optimization section of this README, or the raw EXPLAIN ANALYZE output data in db/query-optimization/vehicle-search-optimization-data.txt
- Tested endpoint functionality both in the browser and with Postman

## Query Optimization (WIP)

### reasoning for each index:
- **index_vehicle_vin:** useful because searches on this parameter will never involve other parameters (no one searches for a blue 0KAMFH817HG984940), so these queries will search a fully indexed column. Also, this column is serialized/auto indremented, so insertions cause no data rearrangement. Note vin is a primary key so it is auto-indexed
- **index_model_name:** there are hundreds of models, so the index searches only a fraction of a percent of the vehicles, fully utilizing the heap
- **index_vehicle_manufacturer:** there are ~50 manufacturers, searching with this param removes 98% of output
- **index_vehicle_year:** our inventory includes vehicles from a 25 year span, allowing the index to only scan the relevent 4% of the table
- **index_vehicle_name_year:** this composite index corresponds to the most common composite search from users
- **index_transaction_id** is a primary key so is already indexed, good because it is used in multiple joins and is auto-incremented/causes no overhead from writes
- **index_transaction_date:** used in multiple joins
- **index_sale_transaction** is a primary key so is already indexed, useful because it is used in foreign key joins


### runtime of queries with and without indexes (from EXPLAIN ANALYZE queries):
```plaintext

Column Searched             Indexed Runtime         Non-Indexed Runtime        Ratio
                     
    model name/year              .052ms                  7.915ms                  152.211x faster
    manufacturer                 .683ms                  18.626ms                 27.27x faster
    model year                   .912ms                  3.808ms                  4.18x faster
    model name                   .053ms                  7.348ms                  138.64x faster

```

## Technologies

### used by me:
- **Backend:** Python, Flask, Psycopg3, PostgreSQL
- **Frontend:** HTML, CSS
- **Infrastructure:** Docker, AWS EC2
- **Other:** EER Diagrams, Postman

### additional tech in the app:
- **Frontend:** React, NGINX


## Future Work / TODO
- **Add redis based caching layer** - The indexes will not be useful while this table still his this few tuples, so I'm eager to implement caching. The vehicle search could be extremely performant if all vals existed in RAM, which would only give up 30kb (355 tuples * ~80 bytes per tuple)
- **Fix errors** - cookies wont persist across pages, try implementing TLS certificate/HTTPS to give options when setting samesite attributes
- **Enlist help from a frontend dev** - there are API and DB functionalities that aren't even accessible to or working for users, but I have no time or need to learn React
