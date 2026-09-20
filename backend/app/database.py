
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# SQLAlchemy setup
engine = create_engine(settings.DATABASE_URL) if settings.DATABASE_URL else None
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) if engine else None
Base = declarative_base()

# Dependency
def get_db():
    if SessionLocal is None:
        raise Exception('Database not configured. Set DATABASE_URL in .env')
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

