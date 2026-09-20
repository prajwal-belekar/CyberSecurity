# 🛡️ CyberSentinel

> **An AI-assisted cybersecurity monitoring and threat analysis platform**

CyberSentinel is a full-stack cybersecurity platform designed to bring multiple security monitoring and analysis capabilities into one dashboard.

Instead of using separate tools for network monitoring, suspicious activity detection, phishing analysis, threat intelligence, incident management, and security reporting, CyberSentinel aims to provide a **single security command center**.

The project is being developed as a portfolio/resume project to demonstrate practical knowledge of:

* Cybersecurity
* Security monitoring
* Threat detection
* Backend development
* Frontend development
* APIs
* Databases
* AI-assisted security analysis
* Real-time systems
* Security analytics

---

# 🎯 What Problem Does CyberSentinel Solve?

Modern applications generate a large amount of security-related information.

For example:

* Failed login attempts
* Suspicious IP addresses
* Unusual network activity
* Phishing URLs
* Suspicious files
* Web security issues
* Threat intelligence indicators
* Authentication events

These events can become difficult to monitor when they are spread across different systems.

CyberSentinel attempts to solve this by creating a centralized platform where security events can be:

```text
Collected
   ↓
Normalized
   ↓
Analyzed
   ↓
Correlated
   ↓
Risk Scored
   ↓
Converted into Alerts
   ↓
Investigated
   ↓
Reported
```

---

# 🚀 Main Features

CyberSentinel is being developed as a modular cybersecurity platform.

## 1. Security Dashboard

The main dashboard provides an overview of the security environment.

It can display:

* Total security events
* Critical alerts
* High-risk alerts
* Open incidents
* Suspicious IP addresses
* Threat indicators
* Recent security events
* Security trends
* Network activity

---

## 2. Security Event Collection

CyberSentinel can receive security events through APIs.

Example:

```json
{
  "event_type": "login",
  "username": "admin",
  "source_ip": "192.168.1.20",
  "timestamp": "2026-09-21T10:30:00"
}
```

These events become the basic input for the detection system.

---

## 3. Detection Engine

The detection engine analyzes incoming events and looks for suspicious patterns.

Example:

```text
Failed login
      ↓
Failed login
      ↓
Failed login
      ↓
Failed login
      ↓
Failed login
      ↓
Suspicious activity detected
```

Detection can be based on:

* Security rules
* Event frequency
* Known indicators
* Suspicious behavior
* Multiple related events

---

## 4. Risk Scoring

CyberSentinel assigns a risk score to suspicious activity.

Example:

```text
Threat intelligence match      +30
Repeated login failures        +20
Suspicious IP                  +20
Sensitive resource accessed    +20
Unusual behavior               +10
                                ---
                                100
```

The score can then be converted into a severity level such as:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

The exact scoring rules are configurable and are part of the project's development.

---

## 5. Alert Management

When suspicious activity is detected, CyberSentinel creates an alert.

An alert can contain:

* Alert ID
* Event information
* Severity
* Risk score
* Source
* Timestamp
* Detection reason
* Related events
* Current status

Example:

```text
CRITICAL ALERT

Possible Account Compromise

Risk Score: 91

Reasons:
- Multiple failed logins
- Successful login after failures
- Suspicious source IP
- Sensitive resource accessed
```

---

# 🔍 6. Incident Management

Multiple alerts can be connected to a single security incident.

Example:

```text
Alert 1 ─┐
Alert 2 ─┼──→ Incident
Alert 3 ─┤
Alert 4 ─┘
```

An incident can move through different states:

```text
NEW
 ↓
INVESTIGATING
 ↓
CONTAINED
 ↓
RESOLVED
```

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


