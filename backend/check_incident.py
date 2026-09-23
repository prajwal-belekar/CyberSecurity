from app.database import SessionLocal
from app.models import Incident
db = SessionLocal()
incident = db.query(Incident).filter(Incident.incident_id == 'INC-2048').first()
if incident:
    print(f'Found INC-2048: {incident.title}')
    print(f'Source: {incident.source}')
    print(f'Target: {incident.target}')
    print(f'Severity: {incident.severity}')
    print(f'Status: {incident.status}')
else:
    print('INC-2048 not found')