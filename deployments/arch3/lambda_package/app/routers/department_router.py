from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas import schemas
from app.repositories import department_repo
from app.middleware import auth_middleware
from app.utils.audit_logger import log_activity, log_audit
from typing import List

router = APIRouter(prefix="/api/departments", tags=["Departments"])

@router.get("", response_model=List[schemas.DepartmentResponse])
def get_departments(
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_employee)
):
    results = department_repo.get_departments_with_counts(db)
    
    # Format the response from Tuple[Department, int] to schema
    output = []
    for dept, count in results:
        dept_dict = {
            "id": dept.id,
            "name": dept.name,
            "description": dept.description,
            "manager_name": dept.manager_name,
            "created_at": dept.created_at,
            "employee_count": count
        }
        output.append(dept_dict)
    return output

@router.post("", response_model=schemas.DepartmentResponse)
def create_department(
    dept_in: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_admin)
):
    # Check if department name already exists
    if department_repo.get_department_by_name(db, dept_in.name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Department with name '{dept_in.name}' already exists"
        )
    
    dept_data = dept_in.model_dump()
    db_dept = department_repo.create_department(db, dept_data)
    
    # Log actions
    log_activity(db, current_user.id, "CREATE_DEPARTMENT", f"Created department '{db_dept.name}'")
    log_audit(db, "departments", db_dept.id, "INSERT", None, dept_data, current_user.id)
    
    # Return response model
    db_dept.employee_count = 0
    return db_dept

@router.put("/{id}", response_model=schemas.DepartmentResponse)
def update_department(
    id: int,
    dept_in: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_admin)
):
    db_dept = department_repo.get_department_by_id(db, id)
    if not db_dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with ID {id} not found"
        )
    
    # Check if name is updated and duplicates another
    existing_dept = department_repo.get_department_by_name(db, dept_in.name)
    if existing_dept and existing_dept.id != id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Department with name '{dept_in.name}' already exists"
        )
    
    old_data = {
        "name": db_dept.name,
        "description": db_dept.description,
        "manager_name": db_dept.manager_name
    }
    
    dept_data = dept_in.model_dump()
    updated_dept = department_repo.update_department(db, db_dept, dept_data)
    
    # Log actions
    log_activity(db, current_user.id, "UPDATE_DEPARTMENT", f"Updated department '{updated_dept.name}'")
    log_audit(db, "departments", updated_dept.id, "UPDATE", old_data, dept_data, current_user.id)
    
    # Load current employee count
    from app.models.models import Employee
    count = db.query(Employee).filter(Employee.department_id == updated_dept.id).count()
    updated_dept.employee_count = count
    
    return updated_dept

@router.delete("/{id}")
def delete_department(
    id: int,
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_admin)
):
    db_dept = department_repo.get_department_by_id(db, id)
    if not db_dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with ID {id} not found"
        )
        
    # Check if there are employees in this department
    from app.models.models import Employee
    emp_count = db.query(Employee).filter(Employee.department_id == id).count()
    if emp_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete department with ID {id} because it contains {emp_count} employees"
        )
        
    old_data = {
        "name": db_dept.name,
        "description": db_dept.description,
        "manager_name": db_dept.manager_name
    }
    
    department_repo.delete_department(db, db_dept)
    
    # Log actions
    log_activity(db, current_user.id, "DELETE_DEPARTMENT", f"Deleted department '{db_dept.name}'")
    log_audit(db, "departments", id, "DELETE", old_data, None, current_user.id)
    
    return {"message": "Department successfully deleted"}
