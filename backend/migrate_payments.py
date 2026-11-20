import sys
import os
from sqlalchemy import inspect, text

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import app, db


def migrate():
    with app.app_context():
        print("Verifying and migrating sd_payments schema for Razorpay...")
        try:
            inspector = inspect(db.engine)
            if "sd_payments" in inspector.get_table_names():
                columns = [c["name"] for c in inspector.get_columns("sd_payments")]
                print(f"Current sd_payments columns: {columns}")
                with db.engine.connect() as conn:
                    # Rename legacy columns if present
                    if "cashfree_order_id" in columns and "gateway_order_id" not in columns:
                        print("Renaming 'cashfree_order_id' -> 'gateway_order_id'...")
                        conn.execute(text("ALTER TABLE sd_payments RENAME COLUMN cashfree_order_id TO gateway_order_id;"))
                        conn.commit()
                        columns.append("gateway_order_id")

                    if "cashfree_payment_id" in columns and "gateway_payment_id" not in columns:
                        print("Renaming 'cashfree_payment_id' -> 'gateway_payment_id'...")
                        conn.execute(text("ALTER TABLE sd_payments RENAME COLUMN cashfree_payment_id TO gateway_payment_id;"))
                        conn.commit()
                        columns.append("gateway_payment_id")

                    # Add gateway_order_id if still missing
                    if "gateway_order_id" not in columns:
                        print("Adding missing column 'gateway_order_id'...")
                        conn.execute(text("ALTER TABLE sd_payments ADD COLUMN gateway_order_id VARCHAR(100);"))
                        conn.commit()

                    # Add gateway_payment_id if still missing
                    if "gateway_payment_id" not in columns:
                        print("Adding missing column 'gateway_payment_id'...")
                        conn.execute(text("ALTER TABLE sd_payments ADD COLUMN gateway_payment_id VARCHAR(100);"))
                        conn.commit()

                    # Add payment_session_id if missing
                    if "payment_session_id" not in columns:
                        print("Adding missing column 'payment_session_id'...")
                        conn.execute(text("ALTER TABLE sd_payments ADD COLUMN payment_session_id VARCHAR(255);"))
                        conn.commit()

                    # Add gateway if missing
                    if "gateway" not in columns:
                        print("Adding missing column 'gateway'...")
                        conn.execute(text("ALTER TABLE sd_payments ADD COLUMN gateway VARCHAR(50) DEFAULT 'RAZORPAY';"))
                        conn.commit()

                    # Update all payment records to RAZORPAY
                    try:
                        conn.execute(text("UPDATE sd_payments SET gateway = 'RAZORPAY';"))
                        conn.commit()
                    except Exception as e:
                        print(f"Update gateway note: {e}")

            print("Migration completed successfully!")
        except Exception as e:
            print(f"Migration error: {e}")
            raise e


if __name__ == "__main__":
    migrate()
