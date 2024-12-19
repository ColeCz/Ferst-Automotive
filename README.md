# CS 6400 RDBMS Group Project

## Using the Application
Link: [http://3.147.185.195:8080/login/](http://3.147.185.195:8080/login/)

Credentials (in the format of role - username, password)
  Owner - owner, owner (by far the most interesting view because it encompasses all features)
  Manager - user01, pass01
  clerk - user02, pass02
  salesperson - user03, pass03
  user - no credentials, just ensure you're logged out and route to [http://3.147.185.195:8080/](http://3.147.185.195:8080/). Note that this view is the least interesting. 

## Description
A fullstack car dealership app, used by employees and users. Users can search unsold cars, clerks can search unsold cars and order parts for them, salasmen can search sold and unsold cars and view sales statistics, and owners and managers can do all of the above and more. It is best to view the app with owner permissions. 

## My Contributions
- Designed EER diagram
- Contributed to relational mapping
- Designed schema
- Designed a third of the backend logic, including the search_vehicles() function

## Lacking Areas
- the frontend does not currently show all backend functionality and I have no need to learn React, so I haven't fixed this
- hopefully my vehicle search is working again, I had 60 lines of working code that a group mate kindly changed to 120 lines of not working code and I may not have fixed this yet

## Reference
- Frontend: [http://3.147.185.195:8080/](http://3.147.185.195:8080/)
- Backend: [http://3.147.185.195:8081/](http://3.147.185.195:8081/)
- pgAdmin: [http://3.147.185.195:8082/](http://3.147.185.195:8082/)
