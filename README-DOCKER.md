# Appliance Repair Ticket — Docker setup

## Requirements
- Docker Desktop installed and running on Windows.
- Docker Compose v2 (`docker compose`).

## Start the full application
From the project root (the folder containing `docker-compose.yml`):

```bash
docker compose up --build -d
```

Open the frontend at http://localhost:8080. The backend API is published at http://localhost:8001 and Swagger UI is expected at http://localhost:8001/swagger-ui/index.html.

The Compose file runs PostgreSQL, Spring Boot, and the React frontend. PostgreSQL data is stored in the named volume `appliance_repair_data`.

## Verify containers and logs

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
```

To stop containers while keeping database data:

```bash
docker compose down
```

To stop containers and delete the database volume/data (destructive):

```bash
docker compose down -v
```

## Important note about existing local database data
The Compose setup creates its own PostgreSQL database volume. It does not automatically copy rows from a PostgreSQL database already running on your laptop. Export/import your existing `practicedb` data if those records need to be present in Docker.

The frontend is built with `VITE_API_BASE_URL=http://localhost:8001` because browser JavaScript calls the published host port. Do not replace this with `http://backend:8001` in the browser build: the name `backend` is only resolvable between containers, not by the user's browser.
