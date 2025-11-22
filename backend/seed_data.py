"""
Database seeding script to create sample users and initial data.
Run this script to populate the database with test data for local development.

Usage:
    # First, install dependencies:
    pip install -r requirements.txt
    
    # Then run the seed script:
    python seed_data.py
"""

import sys
import os

# Check if dependencies are installed
try:
    import sqlalchemy
except ImportError:
    print("=" * 60)
    print("ERROR: Dependencies not installed!")
    print("=" * 60)
    print("\nPlease install dependencies first:")
    print("  pip install -r requirements.txt")
    print("\nOr if using a virtual environment:")
    print("  python -m venv venv")
    print("  venv\\Scripts\\activate  # On Windows")
    print("  pip install -r requirements.txt")
    print("=" * 60)
    sys.exit(1)

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine
from app import models
from app.utils import get_password_hash

def seed_database():
    """Create sample users and initial data"""
    db = SessionLocal()
    
    try:
        # Create tables
        models.Base.metadata.create_all(bind=engine)
        
        # Check if test user already exists
        test_user = db.query(models.User).filter(models.User.email == "admin@stockmaster.com").first()
        if test_user:
            print("Test user already exists. Skipping seed.")
            return
        
        # Create test users
        users = [
            {
                "email": "admin@stockmaster.com",
                "password": "admin123",
                "is_active": True
            },
            {
                "email": "manager@stockmaster.com",
                "password": "manager123",
                "is_active": True
            },
            {
                "email": "staff@stockmaster.com",
                "password": "staff123",
                "is_active": True
            }
        ]
        
        print("Creating test users...")
        for user_data in users:
            hashed_password = get_password_hash(user_data["password"])
            user = models.User(
                email=user_data["email"],
                hashed_password=hashed_password,
                is_active=user_data["is_active"]
            )
            db.add(user)
            print(f"  ✓ Created user: {user_data['email']} / {user_data['password']}")
        
        # Create sample categories
        categories = ["Electronics", "Furniture", "Raw Materials", "Tools", "Office Supplies"]
        print("\nCreating sample categories...")
        for cat_name in categories:
            category = db.query(models.Category).filter(models.Category.name == cat_name).first()
            if not category:
                category = models.Category(name=cat_name)
                db.add(category)
                print(f"  ✓ Created category: {cat_name}")
        
        # Create sample warehouse
        warehouse = db.query(models.Warehouse).filter(models.Warehouse.name == "Main Warehouse").first()
        if not warehouse:
            warehouse = models.Warehouse(name="Main Warehouse")
            db.add(warehouse)
            print("\n  ✓ Created warehouse: Main Warehouse")
        
        # Create sample supplier
        supplier = db.query(models.Supplier).filter(models.Supplier.name == "ABC Suppliers").first()
        if not supplier:
            supplier = models.Supplier(name="ABC Suppliers")
            db.add(supplier)
            print("  ✓ Created supplier: ABC Suppliers")
        
        db.commit()
        
        print("\n" + "="*60)
        print("Database seeded successfully!")
        print("="*60)
        print("\nSample Login Credentials:")
        print("-" * 60)
        for user_data in users:
            print(f"Email: {user_data['email']}")
            print(f"Password: {user_data['password']}")
            print()
        print("="*60)
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
