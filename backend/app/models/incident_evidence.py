from sqlalchemy import Column, Integer, ForeignKey, Table
from app.database import Base

# Association table for many-to-many relationship between incidents and security events
incident_evidence = Table(
    'incident_evidence',
    Base.metadata,
    Column('incident_id', Integer, ForeignKey('incidents.id'), primary_key=True),
    Column('event_id', Integer, ForeignKey('security_events.id'), primary_key=True)
)