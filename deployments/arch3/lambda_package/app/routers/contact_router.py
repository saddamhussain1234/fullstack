from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas import schemas
from app.repositories import contact_repo
from app.middleware import auth_middleware
from app.utils.audit_logger import log_activity, log_audit
from typing import List, Optional

router = APIRouter(prefix="/api/contacts", tags=["Contacts"])

@router.get("", response_model=List[schemas.ContactResponse])
def get_contacts(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_employee)
):
    return contact_repo.list_contacts(db, search)

@router.post("", response_model=schemas.ContactResponse)
def create_contact(
    contact_in: schemas.ContactCreate,
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_manager)
):
    if contact_repo.get_contact_by_email(db, contact_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Contact with email '{contact_in.email}' already exists"
        )
    
    contact_data = contact_in.model_dump()
    db_contact = contact_repo.create_contact(db, contact_data)
    
    log_activity(db, current_user.id, "CREATE_CONTACT", f"Created contact '{db_contact.name}'")
    log_audit(db, "contacts", db_contact.id, "INSERT", None, contact_data, current_user.id)
    
    return db_contact

@router.put("/{id}", response_model=schemas.ContactResponse)
def update_contact(
    id: int,
    contact_in: schemas.ContactCreate,
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_manager)
):
    db_contact = contact_repo.get_contact_by_id(db, id)
    if not db_contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contact with ID {id} not found"
        )
        
    existing_contact = contact_repo.get_contact_by_email(db, contact_in.email)
    if existing_contact and existing_contact.id != id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Contact with email '{contact_in.email}' already exists"
        )
        
    old_data = {
        "name": db_contact.name,
        "email": db_contact.email,
        "phone": db_contact.phone,
        "department": db_contact.department,
        "designation": db_contact.designation
    }
    
    contact_data = contact_in.model_dump()
    updated_contact = contact_repo.update_contact(db, db_contact, contact_data)
    
    log_activity(db, current_user.id, "UPDATE_CONTACT", f"Updated contact '{updated_contact.name}'")
    log_audit(db, "contacts", updated_contact.id, "UPDATE", old_data, contact_data, current_user.id)
    
    return updated_contact

@router.delete("/{id}")
def delete_contact(
    id: int,
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_manager)
):
    db_contact = contact_repo.get_contact_by_id(db, id)
    if not db_contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contact with ID {id} not found"
        )
        
    old_data = {
        "name": db_contact.name,
        "email": db_contact.email,
        "phone": db_contact.phone,
        "department": db_contact.department,
        "designation": db_contact.designation
    }
    
    contact_repo.delete_contact(db, db_contact)
    
    log_activity(db, current_user.id, "DELETE_CONTACT", f"Deleted contact '{db_contact.name}'")
    log_audit(db, "contacts", id, "DELETE", old_data, None, current_user.id)
    
    return {"message": "Contact successfully deleted"}
