# CS 6400 RDBMS Group Project

## Using the Application
Link: [http://3.147.185.195:8080/login/](http://3.147.185.195:8080/login/)

Login Credentials 
- this app has several employee and user types. However, the cookies recently stopped persisting across pages and I can't use the cookies from login to set roles. So I manually set the role to "Owner", you can login with the username and password "owner"
- if you go to the 'add vehicle' page, an example seller SSN you can use to add the vehicle is "784939607"

## Description
This is a fullstack car dealership app, it helps several employee types do their jobs and helps users find vehicles to buy. It achieves this through the vehicle search, which will return vehicles that users can do their tasks with (order parts, buy, sell, etc.). General users can search unsold cars and view the vehicle details, but need an employee to purchase vehicles. Clerks manage unsold vehicles, they order parts and decide when they are installed and the vehicle is available again. Salesmen can search sold and unsold cars and have a detailed view of many sales statistics, they can also sell vehicles to users. Owners and managers can do most all of the above. 

## My Contributions
- Designed EER diagram
- Contributed significantly to relational mapping model
- Designed database schema
- Implemented a third of the backend logic, including the entire vehicle search functionality for all roles
- Modified the schema, queries and frontend to handle images
- Contributed to the HTML and CSS on the home and details pages
- Served the project with EC2

## Lacking Areas
- the cookies don't persist, so I can't show all of the role-based functionality. This randomly stopped working without any related code change, and I have tried 5-10 things to fix this to no avail. But I'm considering switching to https when I have the time
- the frontend is lacking. There are a couple of backend/DB features that are working but aren't visible in the frontend, and I don't know react very well to continue this work. These include add and sell vehicles for owners/salesmen.
