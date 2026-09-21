# CyberSentinel

CyberSentinel is a full-stack cybersecurity monitoring and incident response dashboard designed to centralize threat intelligence, security events, alerts, and operational visibility in a single modern interface. It combines a React + TypeScript frontend with a FastAPI backend and a SQLAlchemy data model, giving the project a realistic SOC-style architecture suitable for demos, portfolio work, and further extension into production-grade security tooling.

This project is not just a UI mockup; it is structured like a real security command center with separate concerns for:

- event collection and data modeling
- threat and incident tracking
- security analytics and reporting
- authentication and session flow
- live-simulated security data
- modular page-based operational workflows

---

## Project purpose

The application addresses a common problem in cybersecurity operations: security data is usually spread across multiple systems, dashboards, and logs. CyberSentinel brings those concerns together into one environment where operators can:

- review live and historical security activity
- track threats and incidents
- inspect suspicious indicators and IP activity
- understand network, phishing, malware, and web security events
- investigate security posture through structured views and dashboards
- simulate a command center workflow for security monitoring and response

---

## What this project includes

### Core capabilities

- Security dashboard with key operational metrics
- Threat and incident management views
- Network, phishing, web security, and malware analysis sections
- Authentication and user login flow
- Real-time event simulation and stream-based updates
- Threat intelligence and suspicious indicator tracking
- AI-style security assistant and reporting surfaces
- Responsive, dashboard-style UI for operational monitoring

### Architecture at a glance

The project exposes two major layers:

1. Frontend: React + Vite + TypeScript + Tailwind-inspired component system
2. Backend: FastAPI + SQLAlchemy + Pydantic models for API and database support

The frontend is organized around routed workspace pages such as dashboard, threats, incidents, network, authentication, analytics, reports, and settings. The backend provides a service layer for API authentication and an application shell that can host ORM-backed security entities.

---

## Technology stack

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- TanStack React Query
- Framer Motion
- Recharts
- Lucide React

### Backend

- Python 3.11+
- FastAPI
- SQLAlchemy
- Pydantic
- Alembic
- PostgreSQL-compatible configuration support
- JWT-based auth primitives

### Data and persistence model

The backend models represent the core of a security operations system:

- User
- SecurityEvent
- Threat
- Incident
- Indicator

These entities are defined under [backend/app/models](backend/app/models) and are registered through [backend/app/main.py](backend/app/main.py).

---

## Project structure

```text
CyberSecurity/
├── backend/
│   ├── app/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── enums.py
│   │   ├── main.py
│   │   ├── detection/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── websocket/
│   ├── alembic/
│   ├── tests/
│   ├── requirements.txt
│   └── README.md
├── src/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── store/
│   ├── styles/
│   └── utils/
├── public/
├── package.json
├── requirements.txt
├── tsconfig.json
├── vite.config.ts
├── index.html
├── README.md
└── dist/
```

### Important application entry points

- Frontend entry: [src/main.tsx](src/main.tsx)
- Frontend app shell: [src/app/App.tsx](src/app/App.tsx)
- Route definitions: [src/app/router/index.tsx](src/app/router/index.tsx)
- Backend app bootstrap: [backend/app/main.py](backend/app/main.py)
- Backend config: [backend/app/config.py](backend/app/config.py)
- Database setup: [backend/app/database.py](backend/app/database.py)
- Core model definitions: [backend/app/models](backend/app/models)

---

## Frontend overview

The frontend is a dashboard application built around a global shell and nested route pages. It uses lazy-loaded pages and a central provider layer to manage settings, alerts, notifications, UI state, and simulated live events.

### Main shell

The application shell is implemented in [src/components/layout/AppLayout.tsx](src/components/layout/AppLayout.tsx). It includes:

- top navigation
- sidebar navigation
- content area
- terminal/status dock
- notification surfaces
- command palette and event detail drawer

### Route structure

The route layer in [src/app/router/index.tsx](src/app/router/index.tsx) provides pages such as:

- Dashboard
- Threats
- Threat detail
- Network
- Authentication
- Phishing
- Web security
- Malware
- Incidents
- AI assistant
- Threat intelligence
- Analytics
- Reports
- Settings

This multi-page dashboard design makes the app feel like a real security operations center rather than a single static landing page.

---

## Backend overview

The backend is built with FastAPI and uses SQLAlchemy models to represent security entities. The application initializes the database and registers the API routers during startup in [backend/app/main.py](backend/app/main.py).

The current backend contains:

- authentication endpoints under [backend/app/routers/auth.py](backend/app/routers/auth.py)
- model declarations for security objects under [backend/app/models](backend/app/models)
- core settings in [backend/app/config.py](backend/app/config.py)
- database dependency setup in [backend/app/database.py](backend/app/database.py)

### Current API features

The active router includes:

- POST /auth/login
- POST /auth/register
- POST /auth/logout
- GET /api/health

The health endpoint is used for service readiness checks and smoke tests.

---

## Data model summary

### SecurityEvent

Represents a single observed security event with fields such as:

- event_id
- timestamp
- event_type
- source
- target
- severity
- status
- description
- metadata

### Threat

Represents an aggregated suspicious pattern or ongoing malicious behavior, including:

- threat_id
- title
- threat type
- severity
- confidence
- indicators
- MITRE info
- related events

### Incident

Represents a tracked security incident with:

- title
- severity
- priority
- status
- summary
- impact
- evidence events
- affected assets
- timeline

### Indicator

Represents an IOC or suspicious artifact such as:

- IP
- domain
- URL
- hash
- email

These models are designed for a modern threat-intelligence workflow and are a strong foundation for future detection logic and API expansion.

---

## Main dashboard behavior

The dashboard page in [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx) combines several operational widgets into a single security overview, including:

- security overview
- threat statistics
- threat activity chart
- severity distribution
- recent events
- active incidents
- network overview
- system health
- terminal status panel

This is the project’s primary “command center” experience and shows the intended user experience clearly.

---

## How the app is intended to work

The project is designed around a security operations flow like this:

```text
Security events are generated or simulated
        ↓
Events are classified and normalized
        ↓
Threats and indicators are correlated
        ↓
Incidents are created and investigated
        ↓
Analytics and reports expose status and risk
```

This structure aligns well with real-world SOC workflows, even though parts of the project still rely on simulated/mock data rather than a fully live detection pipeline.

---

## Setup and installation

### Prerequisites

- Node.js 18+
- npm
- Python 3.11+
- virtual environment support

### Frontend setup

From the project root:

```bash
npm install
npm run dev
```

The frontend runs by default on:

- http://localhost:5173

### Backend setup

From the backend folder:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Then run the API:

```bash
uvicorn app.main:app --reload
```

The backend typically runs on:

- http://127.0.0.1:8000
- Swagger docs: http://127.0.0.1:8000/docs
- Health endpoint: http://127.0.0.1:8000/api/health

---

## Environment configuration

The backend configuration is defined in [backend/app/config.py](backend/app/config.py). Important settings include:

- API_HOST
- API_PORT
- CORS_ORIGINS
- ENVIRONMENT
- DATABASE_URL
- JWT_SECRET_KEY
- JWT_ALGORITHM
- ACCESS_TOKEN_EXPIRE_MINUTES

In production, these values should be moved to a secure environment mechanism and never hardcoded.

---

## Testing status

The project includes backend tests under [backend/tests](backend/tests). The suite checks health and model integrity.

### Verified status

I validated the project with fresh commands:

- Frontend build: `npm run build` succeeded
- Backend test suite: `python -m pytest -q` inside the project venv succeeded with 8 passing tests

This means the repository is currently in a healthy state for the core app build and backend model validation.

---

## Commands

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
npm run lint
```

### Backend

```bash
cd backend
.venv\Scripts\activate
python -m pytest -q
uvicorn app.main:app --reload
```

---

## Current strengths of the project

- Strong visual dashboard design
- Clear security-domain structure
- Good separation between frontend and backend concerns
- SQLAlchemy models aligned with real security entities
- Good portfolio-level presentation for cybersecurity work
- Modern framework choices for a demo or MVP application

---

## Current limitations and improvement opportunities

This project is a strong prototype and portfolio-grade app, but it still has areas that can be hardened further:

- backend endpoints are still limited and not fully connected to the UI layer
- database is not yet fully wired to a production database configuration
- authentication is present but not yet expanded into role-based access control
- live detection logic is mostly simulated rather than connected to a real data source
- security analytics could be expanded with broader correlation and scoring rules
- additional validation, logging, and deployment optimization would be needed for production use

---

## Recommended next steps

1. Connect the frontend services to production-ready backend endpoints
2. Add richer event ingestion and detection rules
3. Expand incident workflow automation and analyst notes
4. Add PostgreSQL and Alembic migration management for real data persistence
5. Add real alert correlation, scoring, and severity logic
6. Introduce RBAC, audit logging, and secure secret management
7. Add deployment configuration for Docker, Azure, or Kubernetes

---

## Conclusion

CyberSentinel is a compelling cybersecurity dashboard project that demonstrates how a modern security operations platform can be organized around live monitoring, threat investigation, and incident workflow management. It is especially strong as a frontend-driven SOC-style dashboard with a backend foundation that can support future expansion into a real detection and incident management tool.

The codebase is already structurally sound, modern, and highly extensible, making it a good candidate for continued development into a more production-oriented security platform.

---

## License

This project does not currently declare a formal license in the repository. If you plan to share or distribute it publicly, it is recommended that you add a LICENSE file and define the intended usage rights.

---

## Quick summary

- Application type: Full-stack cybersecurity monitoring dashboard
- Frontend: React + TypeScript + Vite
- Backend: FastAPI + SQLAlchemy
- Main purpose: SOC-style threat monitoring and incident investigation
- Current validation: frontend build succeeds, backend tests pass


This allows the project to represent a basic Security Operations Center (SOC) workflow.

---

# 🌐 7. Network Monitoring

The network monitoring module is intended to provide visibility into network-related events.

Potential information includes:

* Source IP
* Destination IP
* Port
* Protocol
* Connection information
* Traffic patterns
* Suspicious connections
* Threat indicators

The system can use this information as input to the detection and risk engines.

---

# 🎣 8. Phishing Analysis

CyberSentinel can analyze potentially suspicious URLs or email-related indicators.

The analysis can consider factors such as:

* URL structure
* Domain characteristics
* Suspicious keywords
* Redirect behavior
* HTTPS configuration
* Available reputation information
* Known threat indicators

The result should explain **why** something was considered suspicious rather than simply returning:

```text
SAFE
```

or

```text
MALICIOUS
```

---

# 📁 9. File / Malware Analysis

CyberSentinel can provide static analysis of uploaded files.

Potential analysis includes:

* File type
* File size
* MD5 hash
* SHA-1 hash
* SHA-256 hash
* Metadata
* Entropy
* Suspicious strings
* Threat intelligence information

Example:

```text
FILE ANALYSIS

File: suspicious.exe

Type: Windows Executable

SHA-256:
xxxxxxxxxxxxxxxxxxxxxxxx

Risk:
HIGH

Indicators:
- Suspicious strings
- Abnormal entropy
- Threat intelligence match
```

> ⚠️ Unknown files should not be executed directly on the development machine. Dynamic analysis, if implemented, should be performed in an isolated environment.

---

# 🌎 10. Threat Intelligence

CyberSentinel can enrich security events with external threat intelligence.

For example:

```text
Event
 ↓
IP Address
 ↓
Threat Intelligence
 ↓
Reputation / Indicator Information
 ↓
Risk Engine
```

This can provide additional context for suspicious:

* IP addresses
* Domains
* URLs
* File hashes
* Other indicators

External threat-intelligence providers may require API keys and may have their own usage limits.

---

# 🤖 11. AI Security Analyst

AI is used as an **assistant for security investigation**, rather than being the only detection mechanism.

The AI component can help with:

### Alert explanation

```text
Why was this alert generated?
```

### Incident summary

```text
Summarize this incident.
```

### Event analysis

```text
What events are related to this alert?
```

### Investigation assistance

```text
What should the analyst investigate next?
```

### Report generation

```text
Generate a summary of this security incident.
```

The AI receives relevant security context and produces an explanation for the analyst.

---

# 📊 12. Security Analytics

The dashboard can visualize information such as:

* Events over time
* Alerts by severity
* Incident status
* Authentication activity
* Network activity
* Threat categories
* Detection trends

This makes large amounts of security data easier to understand.

---

# ⚡ 13. Real-Time Monitoring

CyberSentinel is designed to support real-time updates.

The intended architecture is:

```text
Security Event
      ↓
FastAPI Backend
      ↓
Detection Engine
      ↓
Alert
      ↓
WebSocket
      ↓
React Dashboard
      ↓
Live Update
```

This means the dashboard can eventually display new security events without requiring a page refresh.

---

# 🏗️ Project Architecture

The high-level architecture looks like this:

```text
                  ┌─────────────────────┐
                  │   Security Sources  │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │   Event Collection  │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │    Normalization    │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  Detection Engine   │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │    Risk Engine      │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │   Alert Manager     │
                  └──────────┬──────────┘
                             │
                 ┌───────────┴───────────┐
                 ▼                       ▼
        ┌─────────────────┐     ┌─────────────────┐
        │  AI Security    │     │   Incident      │
        │     Analyst     │     │   Management    │
        └────────┬────────┘     └────────┬────────┘
                 │                       │
                 └───────────┬───────────┘
                             ▼
                  ┌─────────────────────┐
                  │   Security Dashboard│
                  └─────────────────────┘
```

---

# 🧰 Tech Stack

## Frontend

| Technology   | Purpose                        |
| ------------ | ------------------------------ |
| React        | User interface                 |
| TypeScript   | Type-safe frontend development |
| Tailwind CSS | Styling                        |
| Recharts     | Security analytics and charts  |

---

## Backend

| Technology | Purpose                      |
| ---------- | ---------------------------- |
| Python     | Backend programming language |
| FastAPI    | REST API framework           |
| Pydantic   | Data validation and settings |
| WebSockets | Real-time communication      |

---

## Database / Infrastructure

| Technology | Purpose                        |
| ---------- | ------------------------------ |
| PostgreSQL | Main database                  |
| Redis      | Caching / event infrastructure |
| SQLAlchemy | Database interaction           |
| Alembic    | Database migrations            |

---

## AI

The AI layer is designed to support:

* Alert explanations
* Incident summaries
* Security analysis
* Investigation assistance
* Report generation

The specific model/provider can be configured independently from the core security system.

---

# 📂 Project Structure

The project is being organized into separate frontend and backend components.

```text
CyberSentinel/
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   │
│   └── package.json
│
├── backend/
│   │
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   │
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── detection/
│   │   ├── intelligence/
│   │   ├── incidents/
│   │   └── ai/
│   │
│   └── requirements.txt
│
├── tests/
│
├── .env.example
├── .gitignore
└── README.md
```

> The exact folder structure may change as development continues.

---

# 💻 Requirements

Before running CyberSentinel, make sure the following are installed.

### Required

* Python 3.11+
* Node.js 20+
* npm
* Git
* PostgreSQL
* Redis

### Recommended

* VS Code
* Docker Desktop
* Python virtual environment
* A modern Chromium-based browser

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd CyberSentinel
```

---

# 🐍 2. Set up the backend

Go to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

### Windows

```powershell
python -m venv .venv
```

Activate it:

```powershell
.venv\Scripts\Activate.ps1
```

If PowerShell blocks the activation script, you can alternatively run:

```powershell
.venv\Scripts\activate.bat
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# 🔐 3. Configure environment variables

Create a `.env` file inside the backend directory.

Example:

```env
APP_ENV=development

DATABASE_URL=postgresql://postgres:password@localhost:5432/cybersentinel

REDIS_URL=redis://localhost:6379

AI_API_KEY=your_api_key_here

THREAT_INTEL_API_KEY=your_api_key_here
```

> Never commit `.env` files containing real API keys or passwords to GitHub.

Use `.env.example` for sharing the required variable names without exposing secrets.

---

# 🗄️ 4. Set up PostgreSQL

Create a PostgreSQL database:

```text
cybersentinel
```

Then configure the connection in `.env`.

Example:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/cybersentinel
```

Database migrations can then be run once the migration system has been configured:

```bash
alembic upgrade head
```

---

# 🔴 5. Start Redis

If Redis is installed locally, start the Redis server.

The default configuration is:

```text
localhost:6379
```

If using Docker:

```bash
docker run --name cybersentinel-redis -p 6379:6379 -d redis
```

---

# 🚀 6. Start the FastAPI backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

The API should then be available at:

```text
http://127.0.0.1:8000
```

FastAPI also provides interactive API documentation at:

```text
http://127.0.0.1:8000/docs
```

and:

```text
http://127.0.0.1:8000/redoc
```

---

# 🌐 7. Start the frontend

Open another terminal.

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at the local URL shown by the development server.

---

# 🧪 Running Tests

Backend tests:

```bash
pytest
```

Frontend tests depend on the configured testing framework.

Before submitting changes, verify:

```text
Backend starts
Database connects
API endpoints work
Frontend starts
Frontend can communicate with backend
Detection rules work
Alerts are generated
Tests pass
```

---

# 🔄 Example Security Event Flow

A simplified example of CyberSentinel detecting suspicious authentication activity:

```text
1. Login attempt occurs
          ↓
2. Event sent to CyberSentinel
          ↓
3. Event validated
          ↓
4. Event stored in database
          ↓
5. Detection engine analyzes it
          ↓
6. Related events are checked
          ↓
7. Risk score is calculated
          ↓
8. Alert is generated
          ↓
9. Threat intelligence enriches the alert
          ↓
10. Incident is created if required
          ↓
11. Dashboard displays the alert
          ↓
12. AI Analyst explains the event
          ↓
13. Analyst investigates
          ↓
14. Incident is resolved
          ↓
15. Security report is generated
```

---

# 🔒 Security Considerations

CyberSentinel is a security-focused project, so security is also important during development.

Important practices include:

* Never commit API keys.
* Never commit passwords.
* Validate all user input.
* Use environment variables for secrets.
* Use authentication and authorization for protected APIs.
* Restrict file uploads.
* Avoid executing untrusted files directly.
* Use isolated environments for dynamic malware analysis.
* Restrict security scanning to authorized targets.
* Log important security events.
* Apply appropriate database permissions.
* Keep dependencies updated.

---

# ⚠️ Responsible Use

CyberSentinel is intended for:

* Education
* Defensive security
* Security monitoring
* Authorized testing
* Research
* Portfolio development

Any active scanning or security testing should only be performed against systems you own or have explicit permission to test.

---

# 🛠️ Development Roadmap

CyberSentinel is being developed incrementally.

### Phase 1 — Backend Foundation

* [x] FastAPI application
* [x] Configuration management
* [x] CORS configuration
* [x] Health endpoint
* [x] Backend project structure

### Phase 2 — Database & Event System

* [ ] PostgreSQL integration
* [ ] Database models
* [ ] Event model
* [ ] Event ingestion API
* [ ] Event validation
* [ ] Database migrations

### Phase 3 — Detection Engine

* [ ] Rule engine
* [ ] Authentication detection
* [ ] Suspicious event detection
* [ ] Event correlation
* [ ] Detection testing

### Phase 4 — Risk & Alerts

* [ ] Risk scoring
* [ ] Severity classification
* [ ] Alert creation
* [ ] Alert API
* [ ] Alert dashboard

### Phase 5 — Security Modules

* [ ] Network monitoring
* [ ] Authentication monitoring
* [ ] Phishing analysis
* [ ] File analysis
* [ ] Web security analysis

### Phase 6 — Threat Intelligence

* [ ] Indicator management
* [ ] IP reputation
* [ ] Domain intelligence
* [ ] Hash intelligence
* [ ] Threat enrichment

### Phase 7 — AI Security Analyst

* [ ] AI integration
* [ ] Alert explanation
* [ ] Incident summarization
* [ ] Investigation assistant
* [ ] Security report generation

### Phase 8 — Real-Time System

* [ ] WebSocket integration
* [ ] Live alerts
* [ ] Live event feed
* [ ] Real-time dashboard updates

### Phase 9 — Testing & Security

* [ ] Unit tests
* [ ] Integration tests
* [ ] API tests
* [ ] Security testing
* [ ] Input validation
* [ ] Authentication/authorization
* [ ] Error handling

### Phase 10 — Deployment

* [ ] Production configuration
* [ ] Docker configuration
* [ ] Database deployment
* [ ] Backend deployment
* [ ] Frontend deployment
* [ ] Monitoring
* [ ] Documentation

---

# 📈 Current Development Status

CyberSentinel is currently in the **early development stage**.

The initial FastAPI backend foundation has been established, including:

```text
backend/app/main.py
backend/app/config.py
```

The next major development milestone is:

```text
PostgreSQL
     ↓
Event Model
     ↓
Event API
     ↓
Detection Engine
     ↓
Risk Scoring
     ↓
Alerts
```

The project will then progressively add the remaining cybersecurity modules.

---

# 🎓 What This Project Demonstrates

CyberSentinel is intended to demonstrate practical knowledge of:

### Programming

* Python
* TypeScript
* REST APIs
* Async programming

### Backend

* FastAPI
* Database design
* API architecture
* Authentication
* WebSockets
* Background processing

### Frontend

* React
* TypeScript
* Component architecture
* Data visualization
* Real-time UI

### Cybersecurity

* Security monitoring
* Event analysis
* Threat detection
* Risk scoring
* Incident management
* Threat intelligence
* Phishing analysis
* File analysis
* Security reporting

### AI

* LLM integration
* Security-event summarization
* AI-assisted investigation
* Structured AI responses

---

# 📌 Project Goal

The long-term goal of CyberSentinel is to create a functional, modular cybersecurity command center that demonstrates how security events can be collected, analyzed, correlated, investigated, and presented through a unified interface.

```text
        CYBERSENTINEL

     Collect Security Data
              ↓
       Detect Threats
              ↓
        Score Risk
              ↓
       Generate Alerts
              ↓
     Investigate Incidents
              ↓
       AI Assistance
              ↓
       Generate Reports
```

---


