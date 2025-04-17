# Ferst Automotive – Car Dealership Management System

## Overview
Ferst Automotive is a fullstack car dealership web application designed for users to search and purchase vehicles and for employees to manage vehicle inventory, transactions, parts, and reports. Built with PostgreSQL, Flask, and React, it supports five different user roles and offers ultra-performant indexed scans on its large datasets. It is containerized with Docker and hosted with AWS EC2.

---

## Features

### User Features
- 🔒 **Role-based access control**: Owner, managers, salespeople, clerks, and users
- 🚗 **Advanced vehicle search**: Uses 0-7 search parameters and a filter, role-specific results
- 🧾 **Vehicle data pages**: Allows dynamic interaction with sales stats, financial reports, etc.
- 🛠️ **Part and transaction management**: For vendors and admins

### Admin/Owner Features
- 📊 **Reports dashboard**: Sales, purchases, revenue over time
- 🔍 **Index-optimized querying**: For quick loading of vehicle and purchase searches (up to 150x faster than no index)
- 👥 **User management**: Login, registration, role setup

---

## Using the application
- Route to [http://3.147.185.195:8080/login/](http://3.147.185.195:8080/login/) and use "owner" for the username and password (this role has access to all features)
- **Note:** I try to leave the server running when I have job applications being reviewed, but if it's down for some reason then please reach out

## Project Directory Layout <br>
<details>
<summary>📁 Click to expand project skeleton</summary>

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
│   └── query-optimization-scripts/ 	# SQL script to insert 50k vals and test indexes. Contains data logs
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
└── relational-mapping-and-eer/        # 📊 Diagrams for EER and mapping

```
</details>


## My Contributions
- Designed the EER model for the 17-table DB (in collaboration with a backend engineer)
- Wrote the relational mapping diagram for the DB
- Formulated the schema script based on the EER model and relational mapping, began RBAC at this level
- Developed multiple API endpoints, including the advanced vehicle search with 0-7 search parameters, a filter, and RBAC
- Optimized the vehicle search with strategic indexing, allowing optimal query speeds with minimal space tradeoff
- Wrote a SQL script to mass-populate the vehicles table to test indexing, allowing me to document speed increases of up to 157x. The script is wrapped in a transaction to rollback the mass import after testing, and you can view the EXPLAIN ANALYZE output data in db/query-optimization/vehicle-search-optimization-data.txt
- Tested endpoint functionality both with the both the browser and with Postman

## Query Optimization

### Reasoning for Each Index:
- **index_vehicle_year:** used because the year runs 

### Explain Analyze Output Data:
```plaintext

Column Searched             Indexed Runtime         Non-Indexed Runtime        Ratio
                     
    model name/year              .052ms                  7.915ms                  152.211x faster
    manufacturer                 .683ms                  18.626ms                 27.27x faster
    model year                   .912ms                  3.808ms                  4.18x faster
    model name                   .053ms                  7.348ms                  138.64x faster

```

## Technologies

### Used by me:
- **Backend:** Python, Flask, Psycopg3, PostgreSQL
- **Frontend:** HTML, CSS
- **Infrastructure:** Docker, AWS EC2
- **Other:** EER Diagrams, Postman

### Additional Tech in the App:
- **Frontend** React, NGINX


## Future Work / TODO
- **Add redis based caching layer** - the vehicle search could be extremely performant if all vals existed in RAM, which it would occupy very little of (355 tuples * ~80 bytes per = 28.4kb)
- **Fix errors** - cookies wont persist across pages and I've had to hardode the role as owner, I think implementing TLS/HTTPS could fix it but I've already invested ~10 hours into this problem
- **Enlist help from a frontend dev** - there are API and DB functionalities that aren't even accessible to or working for users, but I have no need to learn React right now
