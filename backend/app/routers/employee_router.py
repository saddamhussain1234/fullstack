from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas import schemas
from app.services import employee_service
from app.repositories import employee_repo
from app.middleware import auth_middleware
from typing import List, Optional
from datetime import date
from decimal import Decimal

router = APIRouter(prefix="/api/employees", tags=["Employees"])

@router.get("", response_model=schemas.EmployeeListResponse)
def get_employees(
    search: Optional[str] = None,
    department_id: Optional[int] = None,
    status: Optional[str] = None,
    min_salary: Optional[Decimal] = None,
    max_salary: Optional[Decimal] = None,
    joining_date_start: Optional[date] = None,
    joining_date_end: Optional[date] = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_employee)
):
    items, total = employee_service.list_all_employees(
        db, search, department_id, status, min_salary, max_salary,
        joining_date_start, joining_date_end, sort_by, sort_order, page, size
    )
    return {
        "total": total,
        "page": page,
        "size": size,
        "items": items
    }

@router.get("/dashboard")
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_employee)
):
    data = employee_repo.get_employee_dashboard_metrics(db)
    
    # Format recent activities for response
    formatted_activities = []
    for act in data["recent_activities"]:
        formatted_activities.append({
            "id": act.id,
            "user_id": act.user_id,
            "action": act.action,
            "details": act.details,
            "timestamp": act.timestamp,
            "user_email": act.user.email if act.user else "System"
        })
    
    # Query departments and count
    from app.repositories import department_repo
    dept_results = department_repo.get_departments_with_counts(db)
    
    return {
        "total_employees": data["total_employees"],
        "active_employees": data["active_employees"],
        "new_employees_this_month": data["new_employees_this_month"],
        "total_departments": len(dept_results),
        "department_distribution": data["department_distribution"],
        "growth_data": data["growth_data"],
        "recent_activities": formatted_activities
    }

@router.get("/export")
def export_employees(
    search: Optional[str] = None,
    department_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_employee)
):
    csv_content = employee_service.export_employees_to_csv(
        db, search, department_id, status
    )
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=employees_export.csv"}
    )

@router.post("/bulk-delete")
def bulk_delete(
    payload: schemas.List[int],
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_manager)
):
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="No employee IDs provided for deletion"
        )
    deleted = employee_service.bulk_delete_existing_employees(db, payload, current_user.id)
    return {"message": f"Successfully deleted {deleted} employee(s)"}

@router.get("/{id}", response_model=schemas.EmployeeResponse)
def get_employee_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_employee)
):
    return employee_service.get_employee(db, id)

@router.post("", response_model=schemas.EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    employee_in: schemas.EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_manager)
):
    return employee_service.create_new_employee(db, employee_in, current_user.id)

@router.put("/{id}", response_model=schemas.EmployeeResponse)
def update_employee(
    id: int,
    employee_in: schemas.EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_manager)
):
    return employee_service.update_existing_employee(db, id, employee_in, current_user.id)

@router.delete("/{id}")
def delete_employee(
    id: int,
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_manager)
):
    employee_service.delete_existing_employee(db, id, current_user.id)
    return {"message": "Employee successfully deleted"}
