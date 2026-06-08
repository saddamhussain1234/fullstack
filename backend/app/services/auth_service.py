import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session
from app.models.models import User, Role
from app.repositories import user_repo

# Settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "supersecretkeyofficemanagerpro12345")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS = 7

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), 
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = user_repo.get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user

def seed_default_users(db: Session):
    """
    Auto-seeding default Admin, Manager, and Employee users on startup if not present.
    """
    # Ensure roles exist (just in case init.sql didn't run)
    roles = [
        {"id": 1, "name": "Admin", "description": "Full system access and configurations"},
        {"id": 2, "name": "Manager", "description": "Access to manage employees and view department records"},
        {"id": 3, "name": "Employee", "description": "Read-only access to office information"}
    ]
    for r in roles:
        existing_role = db.query(Role).filter(Role.id == r["id"]).first()
        if not existing_role:
            db_role = Role(id=r["id"], name=r["name"], description=r["description"])
            db.add(db_role)
            db.commit()

    # Seed Admin User
    admin_email = "admin@company.com"
    admin_user = db.query(User).filter(User.email == admin_email).first()
    if not admin_user:
        user_repo.create_user(db, {
            "email": admin_email,
            "hashed_password": get_password_hash("admin123"),
            "first_name": "Saddam",
            "last_name": "Hussain",
            "role_id": 1,
            "is_active": True
        })
    else:
        admin_user.first_name = "Saddam"
        admin_user.last_name = "Hussain"
        db.commit()

    # Seed Manager User
    manager_email = "manager@company.com"
    manager_user = user_repo.get_user_by_email(db, manager_email)
    if not manager_user:
        user_repo.create_user(db, {
            "email": manager_email,
            "hashed_password": get_password_hash("manager123"),
            "first_name": "Office",
            "last_name": "Manager",
            "role_id": 2,
            "is_active": True
        })

    # Seed Employee User
    employee_email = "employee@company.com"
    employee_user = user_repo.get_user_by_email(db, employee_email)
    if not employee_user:
        user_repo.create_user(db, {
            "email": employee_email,
            "hashed_password": get_password_hash("employee123"),
            "first_name": "Staff",
            "last_name": "Member",
            "role_id": 3,
            "is_active": True
        })
