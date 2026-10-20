#!/usr/bin/env python
"""Test detection engine functionality."""
import requests

print("=== CYBERSENTINEL DETECTION ENGINE TEST ===")
print()

# 1. Health check
r = requests.get('http://127.0.0.1:8000/api/health')
print("1. Health Check:", r.json())
print()

# 2. List all threats
r = requests.get('http://127.0.0.1:8000/api/threats')
threats = r.json()['items']
print("2. Active Threats:", len(threats))
for t in threats:
    print("   - {}: {} ({}) occurrences={} incident={}".format(
        t["threat_id"], t["title"], t["severity"], t["occurrences"], t["incident_id"]))
print()

# 3. List all incidents
r = requests.get('http://127.0.0.1:8000/api/incidents')
incidents = r.json()['items']
print("3. Active Incidents:", len(incidents))
for i in incidents:
    print("   - {}: {} ({}) priority={}".format(
        i["incident_id"], i["title"], i["severity"], i["priority"]))
print()

# 4. Test detection rules by creating events
print("4. Testing Detection Rules:")

# Test AUTH-010
event = {
    'event_id': 'TEST-AUTH-010',
    'timestamp': '2026-10-21T12:00:00+00:00',
    'event_type': 'Failed login',
    'channel': 'WARN',
    'severity': 'medium',
    'source': '192.168.1.200',
    'target': 'AUTH-SERVICE',
    'description': 'Failed login test',
    'status': 'new'
}
r = requests.post('http://127.0.0.1:8000/api/events', json=event)
data = r.json()
print("   AUTH-010 (Failed login): rule={} threat={}".format(
    data.get("detection_rule"), data.get("threat_id")))

# Test NET-031  
event = {
    'event_id': 'TEST-NET-031',
    'timestamp': '2026-10-21T12:01:00+00:00',
    'event_type': 'Outbound data transfer anomaly',
    'channel': 'NET',
    'severity': 'high',
    'source': '192.168.1.201',
    'target': '10.0.0.50',
    'description': 'Egress anomaly test',
    'status': 'new'
}
r = requests.post('http://127.0.0.1:8000/api/events', json=event)
data = r.json()
print("   NET-031 (Egress anomaly): rule={} threat={}".format(
    data.get("detection_rule"), data.get("threat_id")))

print()
print("=== DETECTION ENGINE OPERATIONAL ===")