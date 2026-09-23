from app.database import engine, Base
from app.models import Incident, SecurityEvent, Threat, Indicator, User
Base.metadata.create_all(bind=engine)
print('Tables created')