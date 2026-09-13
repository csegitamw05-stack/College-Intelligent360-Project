import os
import sys
from dotenv import load_dotenv

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.realpath(__file__))))

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.security.password import hash_password

def seed_admin():
    # Load seed environment variables from .env.seed if it exists
    seed_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.seed")
    if os.path.exists(seed_env_path):
        load_dotenv(seed_env_path)
    
    email = os.getenv("SEED_EMAIL", "admin@campus.edu")
    password = os.getenv("SEED_PASSWORD", "Admin@12345")
    full_name = os.getenv("SEED_NAME", "System Administrator")
    role_str = os.getenv("SEED_ROLE", "PRINCIPAL")
    
    try:
        role = UserRole(role_str.upper())
    except ValueError:
        print(f"Invalid role: {role_str}. Must be one of {[r.value for r in UserRole]}")
        sys.exit(1)
        
    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"User with email {email} already exists. Skipping seed.")
            return

        hashed_pw = hash_password(password)
        new_user = User(
            email=email,
            full_name=full_name,
            role=role,
            hashed_password=hashed_pw,
            is_active=True
        )
        db.add(new_user)
        db.commit()
        print(f"Successfully seeded admin user: {email} with role {role.value}")
    except Exception as e:
        db.rollback()
        print(f"Failed to seed admin user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
