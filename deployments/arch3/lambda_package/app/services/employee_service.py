from sqlalchemy.orm import Session
from app.repositories import employee_repo
from app.schemas import schemas
from app.models.models import Employee
from app.utils.audit_logger import log_activity, log_audit
from fastapi import HTTPException, status
from typing import List, Optional, Tuple
from datetime import date
from decimal import Decimal
import csv
import io

def get_employee(db: Session, employee_id: int) -> Employee:
    db_emp = employee_repo.get_employee_by_id(db, employee_id)
    if not db_emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {employee_id} not found"
        )
    return db_emp

def create_new_employee(db: Session, employee_in: schemas.EmployeeCreate, current_user_id: int) -> Employee:
    # Check if custom employee ID already exists
    if employee_repo.get_employee_by_custom_id(db, employee_in.employee_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee ID '{employee_in.employee_id}' already exists"
        )
    
    # Check if email already exists
    if employee_repo.get_employee_by_email(db, employee_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee email '{employee_in.email}' already exists"
        )

    employee_data = employee_in.model_dump()
    db_emp = employee_repo.create_employee(db, employee_data)

    # Logging
    log_activity(db, current_user_id, "CREATE_EMPLOYEE", f"Created employee {db_emp.first_name} {db_emp.last_name} ({db_emp.employee_id})")
    log_audit(db, "employees", db_emp.id, "INSERT", None, employee_data, current_user_id)

    return db_emp

def update_existing_employee(db: Session, employee_id: int, employee_in: schemas.EmployeeUpdate, current_user_id: int) -> Employee:
    db_emp = get_employee(db, employee_id)
    
    # Prepare old values for auditing
    old_data = {
        col.name: getattr(db_emp, col.name) 
        for col in Employee.__table__.columns 
        if hasattr(db_emp, col.name)
    }

    # Validate email update
    update_dict = employee_in.model_dump(exclude_unset=True)
    if "email" in update_dict and update_dict["email"] != db_emp.email:
        if employee_repo.get_employee_by_email(db, update_dict["email"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Employee email '{update_dict['email']}' already exists"
            )

    updated_emp = employee_repo.update_employee(db, db_emp, update_dict)

    # Logging
    log_activity(db, current_user_id, "UPDATE_EMPLOYEE", f"Updated employee {updated_emp.first_name} {updated_emp.last_name} ({updated_emp.employee_id})")
    log_audit(db, "employees", updated_emp.id, "UPDATE", old_data, update_dict, current_user_id)

    return updated_emp

def delete_existing_employee(db: Session, employee_id: int, current_user_id: int) -> bool:
    db_emp = get_employee(db, employee_id)

    old_data = {
        col.name: getattr(db_emp, col.name) 
        for col in Employee.__table__.columns 
        if hasattr(db_emp, col.name)
    }

    employee_repo.delete_employee(db, db_emp)

    # Logging
    log_activity(db, current_user_id, "DELETE_EMPLOYEE", f"Deleted employee {db_emp.first_name} {db_emp.last_name} ({db_emp.employee_id})")
    log_audit(db, "employees", employee_id, "DELETE", old_data, None, current_user_id)

    return True

def bulk_delete_existing_employees(db: Session, employee_ids: List[int], current_user_id: int) -> int:
    deleted_count = employee_repo.bulk_delete_employees(db, employee_ids)
    
    # Logging
    log_activity(db, current_user_id, "BULK_DELETE_EMPLOYEES", f"Bulk deleted {deleted_count} employees. Target IDs: {employee_ids}")
    for emp_id in employee_ids:
        log_audit(db, "employees", emp_id, "DELETE", {"id": emp_id, "note": "Bulk deletion"}, None, current_user_id)
        
    return deleted_count

def list_all_employees(
    db: Session,
    search: Optional[str] = None,
    department_id: Optional[int] = None,
    status: Optional[str] = None,
    min_salary: Optional[Decimal] = None,
    max_salary: Optional[Decimal] = None,
    joining_date_start: Optional[date] = None,
    joining_date_end: Optional[date] = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    page: int = 1,
    size: int = 10
) -> Tuple[List[Employee], int]:
    return employee_repo.list_employees(
        db, search, department_id, status, min_salary, max_salary, 
        joining_date_start, joining_date_end, sort_by, sort_order, page, size
    )

def export_employees_to_csv(db: Session, search: Optional[str] = None, department_id: Optional[int] = None, status: Optional[str] = None) -> str:
    # Fetch all employees matching criteria without pagination
    employees, _ = employee_repo.list_employees(
        db=db, search=search, department_id=department_id, status=status, page=1, size=10000
    )

    csv_buf = io.StringIO()
    writer = csv.writer(csv_buf)
    
    # Write headers
    headers = [
        "Employee ID", "First Name", "Last Name", "Email", "Phone Number", 
        "Department", "Designation", "Salary", "Joining Date", "City", 
        "State", "Country", "Status", "AI Bio"
    ]
    writer.writerow(headers)
    
    # Write records
    for emp in employees:
        writer.writerow([
            emp.employee_id,
            emp.first_name,
            emp.last_name,
            emp.email,
            emp.phone_number,
            emp.department.name if emp.department else "",
            emp.designation,
            str(emp.salary),
            emp.joining_date.isoformat() if emp.joining_date else "",
            emp.city or "",
            emp.state or "",
            emp.country or "",
            emp.status,
            emp.ai_bio or ""
        ])
        
    return csv_buf.getvalue()
