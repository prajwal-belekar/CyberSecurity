from sqlalchemy import Column, String, DateTime, Integer, Text, JSON, Enum, ForeignKey
from sqlalchemy.sql import func
from app.enums import IndicatorType, Severity, IndicatorStatus
from app.database import Base


class Indicator(Base):
    __tablename__ = "indicators"

    id = Column(Integer, primary_key=True, index=True)
    indicator_id = Column(String, unique=True, index=True, nullable=False)
    value = Column(String, nullable=False)
    indicator_type = Column(Enum(IndicatorType), nullable=False)
    risk = Column(Enum(Severity), nullable=False)
    status = Column(Enum(IndicatorStatus), nullable=False)
    first_seen = Column(DateTime(timezone=True), nullable=False)
    last_seen = Column(DateTime(timezone=True), nullable=False)
    source = Column(String, nullable=False)
    confidence = Column(String, nullable=True)  # Storing as string to match mock data format
    related_events = Column(Integer, nullable=False)
    tags = Column(JSON, nullable=True)  # Storing as JSON array
    threat_actor = Column(String, nullable=True)
    campaign = Column(String, nullable=True)
    country = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    whois = Column(JSON, nullable=True)
    references = Column(JSON, nullable=True)  # Storing as JSON array
    created_at = Column(DateTime(timezone=True), server_default=func.now())