from app.database import SessionLocal
from app.models import SecurityEvent
db = SessionLocal()
events = db.query(SecurityEvent).filter(SecurityEvent.event_id.in_(["EVT-8841", "EVT-8842", "EVT-8843", "EVT-8844", "EVT-8845", "EVT-8846", "EVT-8847", "EVT-8848"])).all()
print(f'Found {len(events)} evidence events:')
for event in events:
    print(f'  {event.event_id}: {event.source} -> {event.target} ({event.severity.value})')