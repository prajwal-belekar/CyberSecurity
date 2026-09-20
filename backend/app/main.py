from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import auth
# Import models to register them with Base.metadata
from app.models import User

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    if engine:
        Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    if engine:
        engine.dispose()

app = FastAPI(
    title='CyberSentinel API',
    version='0.1.1.0',
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(',') if settings.CORS_ORIGINS else ['http://localhost:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Include routers
app.include_router(auth.router)

@app.get('/api/health')
async def health():
    return {'status': 'ok', 'service': 'cybersentinel-api'}
