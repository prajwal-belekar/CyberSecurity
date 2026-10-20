#!/usr/bin/env python
"""Setup PostgreSQL database for CyberSentinel."""

import subprocess
import os

def run_sql(sql_cmd):
    """Run a SQL command using psql."""
    result = subprocess.run(
        ['psql', '-U', 'postgres', '-c', sql_cmd],
        capture_output=True, text=True, timeout=30
    )
    return result.stdout, result.stderr

def modify_pg_hba():
    """Modify pg_hba.conf to use trust authentication."""
    hba_path = r"C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
    
    with open(hba_path, 'r') as f:
        content = f.read()
    
    # Replace scram-sha-256 with trust for local connections
    content = content.replace(
        'local   all             all                                     scram-sha-256',
        'local   all             all                                     trust'
    )
    
    with open(hba_path, 'w') as f:
        f.write(content)
    
    print("pg_hba.conf modified to use trust authentication")

def restart_postgresql():
    """Restart PostgreSQL service."""
    result = subprocess.run(
        ['sc', 'restart', 'postgresql-18'],
        capture_output=True, text=True, timeout=30
    )
    print("PostgreSQL restart result:", result.stdout)

def create_database():
    """Create the cybersentinel database."""
    stdout, stderr = run_sql('CREATE DATABASE cybersentinel;')
    if 'CREATE DATABASE' in stdout or 'already exists' in stderr.lower():
        print("Database created/verified successfully")
        return True
    print("Error creating database:", stderr)
    return False

if __name__ == '__main__':
    print("Step 1: Modify pg_hba.conf")
    modify_pg_hba()
    
    print("\nStep 2: Restart PostgreSQL")
    restart_postgresql()
    
    print("\nStep 3: Create database")
    if create_database():
        print("Database setup complete!")
    else:
        print("Database setup failed")