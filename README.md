# OnlyPropFirms (MVP Phase 0)

> **Status:** Phase 0 (Validation)  
> **Goal:** Validate core comparison logic with minimal infrastructure.

## 🏗 Architecture (MVP)

- **Frontend:** Next.js 14 (Standalone Docker Mode)
- **Backend:** Java Spring Boot 3 + JPA
- **Database:** PostgreSQL 16
- **Infra:** Docker Compose (Local)

## 🚀 Quick Start

**Prerequisites:** Docker & Docker Compose installed.

1. **Clone & Setup Environment**
   ```bash
   cp .env.example .env
   ```

2. **Start Infrastructure**
   ```bash
   cd infrastructure/docker
   docker-compose up --build
   ```

3. **Access Services**
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:8081/api/v1/prop-firms](http://localhost:8081/api/v1/prop-firms)
   - **Database:** Port `5432` (User: `admin`, Pass: `admin123`)

## 📚 API Endpoints (Phase 0)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/prop-firms` | List all firms (JSON) |
| `GET` | `/api/v1/prop-firms/{id}` | Get firm details |
| `POST` | `/api/v1/filter-firms` | Filter firms by criteria |

## 🛠 Troubleshooting

- **Database Connection Refused?** Ensure `docker-compose` is running and `postgres` container is healthy (`docker ps`).
- **Frontend Build Fails?** Check `frontend/Dockerfile` assumes `package-lock.json` exists. Run `npm install` locally once if missing.
- **Port Conflict?** Ensure ports 3000, 8080, 5432 are free.
