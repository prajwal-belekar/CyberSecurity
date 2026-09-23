from app.database import SessionLocal
from app.models import Incident, SecurityEvent
db = SessionLocal()
incident = db.query(Incident).filter(Incident.incident_id == 'INC-2048').first()
if incident:
    evidence = db.query(SecurityEvent).filter(SecurityEvent.incident_id == incident.id).all()
    print(f'Found {len(evidence)} evidence events for INC-2048:')
    for event in evidence:
        print(f'  {event.event_id}: {event.source} -> {event.target} ({event.severity})')
else:
    print('INC-2048 not found')