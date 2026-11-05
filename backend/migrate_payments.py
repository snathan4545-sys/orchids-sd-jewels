import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import app, db
from models import Payment

def migrate():
    with app.app_context():
        print("Migrating Cashfree Payments table schema...")
        db.create_all()
        print("Successfully created/verified 'sd_payments' table in database.")

if __name__ == '__main__':
    migrate()
