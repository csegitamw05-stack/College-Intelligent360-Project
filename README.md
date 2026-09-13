# CAMPUS INTELLIGENCE 360

> **Subtitle:** An AI-Powered Digital Twin & Early-Warning Decision Support System for Smart Academic Institutions  
> **Tagline:** From Campus Data to Intelligent Decisions.

---

## 1. Project Overview

Campus Intelligence 360 is a full-stack, enterprise-grade decision support platform designed to transform institutional academic data into real-time operational intelligence.

### Key Highlights:
- **Zero Mock Data Policy**: All dashboard metrics, early warning indicators, and reports calculate dynamically from SQL database records (`Attendance`, `AcademicPerformance`, `Assessment`, `LabPerformance`, `StudentEngagement`, `FacultyActivity`, `Research`, `Placement`).
- **Secure Data Upload & Import Station**: Supports CSV, XLSX, XLS, PDF, DOCX, TXT, JSON, PNG/JPG, and ZIP with extension + MIME magic verification, executable binary scan, private repository storage, and row-level column mapping/validation.
- **Genuine Scikit-Learn ML Early Warning Engine**: Scikit-Learn classification model with SHAP feature contribution explainability and 4 risk levels (`NORMAL`, `WATCH`, `INTERVENTION_REQUIRED`, `CRITICAL`). Includes data sufficiency safeguards (<10 records fallback) and model replacement checks.
- **AI-HOD Assistant**: Role-aware natural language decision assistant with controlled ORM query layer (No raw SQL execution!).
- **Advanced Decision Support**: Factor-derived AI Recommendations and interactive What-If Policy Simulator (outputs labeled `ESTIMATED SCENARIO`).
- **Institutional Reports & Exports**: 8 official report types with instant export to CSV, Excel (`.xlsx`), and PDF with RBAC department isolation.
- **Production Hardened & Dockerized**: Built with FastAPI, Next.js 14, PostgreSQL, Redis, Nginx, Pytest suite, and Docker Compose.

---

## 2. Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, TanStack React Query, Axios, Lucide Icons.
- **Backend**: Python 3.11, FastAPI, SQLAlchemy 2.0 ORM, Alembic migrations, Pydantic v2, Scikit-Learn, Pandas, Pytest.
- **Database & Cache**: PostgreSQL 16 (or SQLite fallback), Redis 7.
- **Deployment & Proxy**: Docker Compose, Nginx reverse proxy.

---

## 3. Security Architecture

1. **Authentication**: JWT access tokens (15 min expire) + refresh tokens (7 days), password hashing via `passlib[bcrypt]`.
2. **Account Lockout & Rate Limiting**: Max 5 failed login attempts triggers 15-min lockout. Endpoint rate limiting via `slowapi`.
3. **MIME & Executable Security Scan**: File uploads double-checked with extension + `python-magic` MIME inspection. Binary executable headers (`MZ`, `ELF`) blocked immediately.
4. **Controlled AI Query Layer**: AI-HOD Assistant parses natural language into structured parameters executed via SQLAlchemy ORM queries. LLM NEVER executes raw SQL.
5. **RBAC & Department Isolation**:
   - `PRINCIPAL` / `SYSTEM_ADMIN`: Campus-wide telemetry, institutional reports, health weights configurator.
   - `HOD`: Scoped exclusively to assigned department records (`department_id` filter enforced server-side).
   - `INCHARGE`: Scoped to assigned course attendance and student assessment logging.
6. **Secrets Management**: All credentials configured via `.env` environment variables.

---

## 4. Environment Variables

Create `.env` in `backend/`:
```env
PROJECT_NAME="Campus Intelligence 360"
VERSION="1.0.0"
API_V1_STR="/api/v1"
ENVIRONMENT="development"
DEBUG=True

# Database Configuration (PostgreSQL / SQLite)
POSTGRES_SERVER="localhost"
POSTGRES_PORT=5432
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DB="campus_intel_db"
DATABASE_URL="sqlite:///./campus_intel.db"

# Redis & CORS
REDIS_URL="redis://localhost:6379/0"
CORS_ORIGINS='["http://localhost:3000", "http://127.0.0.1:3000"]'

# Security
SECRET_KEY="campus_intel_360_secret_key_environment_configured"
ACCESS_TOKEN_EXPIRE_MINUTES=11520
```

---

## 5. Local Setup & Execution

### Backend
1. `cd backend`
2. `python -m venv venv`
3. `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Linux/macOS)
4. `pip install -r requirements.txt`
5. `python scripts/seed_demo.py` (Seeds realistic demo data)
6. `uvicorn main:app --reload --port 8000`

- Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open browser at [http://localhost:3000](http://localhost:3000)

---

## 6. Docker Deployment

Launch PostgreSQL, Redis, FastAPI Backend, Next.js Frontend, and Nginx reverse proxy:

```bash
docker-compose up --build -d
```

Access services at:
- Web Application: [http://localhost:3000](http://localhost:3000)
- Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 7. Testing Suite

Run automated Pytest tests for calculation accuracy, AI Assistant query safety, ML early warning predictions, and RBAC authorization:

```bash
cd backend
pytest
```

---

## 8. Backup & Disaster Recovery

### PostgreSQL Backup
```bash
docker exec -t campus_intel_postgres pg_dump -U postgres campus_intel_db > backup_$(date +%Y%m%d).sql
```

### PostgreSQL Restore
```bash
cat backup_20260913.sql | docker exec -i campus_intel_postgres psql -U postgres -d campus_intel_db
```

### Private File Repository Backup
```bash
tar -czvf private_uploads_backup_$(date +%Y%m%d).tar.gz backend/private_uploads/
```
