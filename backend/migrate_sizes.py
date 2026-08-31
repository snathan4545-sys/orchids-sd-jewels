from app import app
from models import db
from sqlalchemy import text

with app.app_context():
    print("Creating tables if they don't exist...")
    db.create_all()

    print("Adding sizes_json column to sd_products if it doesn't exist...")
    try:
        db.session.execute(text("ALTER TABLE sd_products ADD COLUMN sizes_json TEXT"))
        db.session.commit()
        print("sizes_json column added successfully.")
    except Exception as e:
        db.session.rollback()
        print("sizes_json might already exist, or error:", e)
    
    print("Migration complete!")
