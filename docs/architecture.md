# CAMPUS INTELLIGENCE 360 - Architecture Documentation

## Subtitle
“An AI-Powered Digital Twin & Early-Warning Decision Support System for Smart Academic Institutions”

## Tagline
“From Campus Data to Intelligent Decisions.”

---

## 1. System Overview

Campus Intelligence 360 is built using a clean multi-tier architecture separating concerns between client representation, backend orchestration, data persistence, and intelligence services.

```
+-------------------------------------------------------------+
|                      Next.js Frontend                       |
|         (React 18 / TypeScript / Tailwind CSS / Query)      |
+-------------------------------------------------------------+
                              | REST API (Axios / JSON)
                              v
+-------------------------------------------------------------+
|                     FastAPI REST Service                    |
|             (API Layer / Auth / Controllers)                |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                        Service Layer                        |
|       (Business Rules / Domain Validation / Analytics)      |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                  Repository / Data Access                   |
|               (SQLAlchemy ORM 2.0 / Alembic)                |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                    PostgreSQL Relational DB                 |
|       (Normalized entities, FK constraints, Indexing)       |
+-------------------------------------------------------------+
```

---

## 2. Core Modules (Planned Entities)

1. **Attendance**: Track student class/lab attendance with dynamic analytics.
2. **Academic Performance**: Dynamic GPA, marks distribution, subject performance tracking.
3. **Assessments**: Assignments, internal tests, exams, scoring matrices.
4. **Student Engagement**: Extracurriculars, portal activity, early warning engagement flags.
5. **Faculty Activities**: Course loads, publications, workloads, departmental duties.
6. **Labs & Lab Performance**: Equipment usage, practical submissions, lab assessments.
7. **Events**: Institutional seminars, workshops, participation tracking.
8. **Placements**: Student eligibility, recruitment pipeline, offer tracking.
9. **Research**: Grants, publications, citations, institutional research metrics.

---

## 3. Strict Compliance Rules

- **Zero Mock Data Policy**: All displayed statistics originate from real database tables and calculations. Empty states are displayed when data is absent.
- **Secure Configuration**: No hardcoded API keys or credentials.
- **Dynamic Calculations**: No static hardcoded metrics.
