from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.models import Contact
from typing import List, Optional

def get_contact_by_id(db: Session, contact_id: int) -> Optional[Contact]:
    return db.query(Contact).filter(Contact.id == contact_id).first()

def get_contact_by_email(db: Session, email: str) -> Optional[Contact]:
    return db.query(Contact).filter(Contact.email == email).first()

def create_contact(db: Session, contact_data: dict) -> Contact:
    db_contact = Contact(**contact_data)
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

def update_contact(db: Session, db_contact: Contact, update_data: dict) -> Contact:
    for key, value in update_data.items():
        setattr(db_contact, key, value)
    db.commit()
    db.refresh(db_contact)
    return db_contact

def delete_contact(db: Session, db_contact: Contact) -> bool:
    db.delete(db_contact)
    db.commit()
    return True

def list_contacts(db: Session, search: Optional[str] = None) -> List[Contact]:
    query = db.query(Contact)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Contact.name.ilike(search_filter),
                Contact.email.ilike(search_filter),
                Contact.phone.ilike(search_filter),
                Contact.department.ilike(search_filter),
                Contact.designation.ilike(search_filter)
            )
        )
    return query.order_by(Contact.name.asc()).all()
