from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import auth, events, threats, incidents, indicators, ai, network, phishing, malware, web_security
from app.websocket import router as websocket_router
# Import models to register them with Base.metadata
from app.models import User
from app.models import SecurityEvent
from app.models import Threatfrom app.models = Incident
from app.models = Indicator
