import sqlalchemy
from app.database import engine
print('Engine:', engine)
print('Connecting...')
try:
    conn = engine.connect()
    print('Connection successful!')
    conn.close()
except Exception as e:
    print('Connection failed:', e)