# cs6400-2024-03-Team073

## Getting started
I personally use Docker Desktop (with WSL) and PyCharm, but feel free to use whatever IDE and container setup you prefer

Run all the below commands in the root directory of the repo (the same folder this README is in)

### Starting up the environment:
```shell
docker compose up -d --build
```
Services can be accessed using the links in the Reference section. Rerunning this command will rebuild and restart containers that have changes

### Stopping the environment:
```shell
docker compose down
```
Containers will be stopped and removed, but volumes (including db data) will not be removed unless the **-v** flag is added.

## Reference
- Frontend: [http://localhost:8080/](http://localhost:8080/)
- Backend: [http://localhost:8081/](http://localhost:8081/)
- pgAdmin: [http://localhost:8082/](http://localhost:8082/)