# CyberSentinel Backend

FastAPI-based cybersecurity platform backend.

## Prerequisites

- Python 3.11+
- PostgreSQL (optional for mock development)

## Setup

1.  **Create Virtual Environment:**
    ```powershell
    python -m venv .venv
    ```

2.  **Activate Virtual Environment:**
    ```powershell
    .venv\Scripts\activate
    ```

3.  **Install Dependencies:**
    ```powershell
    pip install -r requirements.txt
    ```

4.  **Configure Environment:**
    Copy `.env.example` to `.env` and adjust settings.

## Running the Backend

```powershell
uvicorn app.main:app --reload
```

- **Health Check:** `http://127.0.0.1:8000/api/health`
- **Swagger Docs:** `http://127.0.0.1:8000/docs`

## Running Tests

```powershell
pytest
```
