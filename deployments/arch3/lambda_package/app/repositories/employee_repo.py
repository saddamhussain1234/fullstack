from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from app.models.models import Employee, Department
from typing import List, Tuple, Optional
from decimal import Decimal
from datetime import date

def get_employee_by_id(db: Session, employee_id: int) -> Optional[Employee]:
    return db.query(Employee).options(joinedload(Employee.department)).filter(Employee.id == employee_id).first()

def get_employee_by_custom_id(db: Session, employee_id_str: str) -> Optional[Employee]:
    return db.query(Employee).filter(Employee.employee_id == employee_id_str).first()

def get_employee_by_email(db: Session, email: str) -> Optional[Employee]:
    return db.query(Employee).filter(Employee.email == email).first()

def create_employee(db: Session, employee_data: dict) -> Employee:
    db_employee = Employee(**employee_data)
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def update_employee(db: Session, db_employee: Employee, update_data: dict) -> Employee:
    for key, value in update_data.items():
        setattr(db_employee, key, value)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def delete_employee(db: Session, db_employee: Employee) -> bool:
    db.delete(db_employee)
    db.commit()
    return True

def bulk_delete_employees(db: Session, employee_ids: List[int]) -> int:
    deleted_count = db.query(Employee).filter(Employee.id.in_(employee_ids)).delete(synchronize_session=False)
    db.commit()
    return deleted_count

def list_employees(
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
    query = db.query(Employee).options(joinedload(Employee.department))

    # Apply search filter
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Employee.first_name.ilike(search_filter),
                Employee.last_name.ilike(search_filter),
                Employee.email.ilike(search_filter),
                Employee.employee_id.ilike(search_filter),
                Employee.designation.ilike(search_filter)
            )
        )

    # Apply specific filters
    if department_id is not None:
        query = query.filter(Employee.department_id == department_id)
    if status:
        query = query.filter(Employee.status == status)
    if min_salary is not None:
        query = query.filter(Employee.salary >= min_salary)
    if max_salary is not None:
        query = query.filter(Employee.salary <= max_salary)
    if joining_date_start:
        query = query.filter(Employee.joining_date >= joining_date_start)
    if joining_date_end:
        query = query.filter(Employee.joining_date <= joining_date_end)

    # Total count before pagination
    total_count = query.count()

    # Apply sorting
    if hasattr(Employee, sort_by):
        sort_column = getattr(Employee, sort_by)
        if sort_order.lower() == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(Employee.id.asc())

    # Apply pagination
    offset = (page - 1) * size
    items = query.offset(offset).limit(size).all()

    return items, total_count

def get_employee_dashboard_metrics(db: Session):
    # Total count
    total_employees = db.query(Employee).count()
    active_employees = db.query(Employee).filter(Employee.status == 'Active').count()
    
    # New Employees this month
    from datetime import datetime
    today = datetime.now()
    first_day_of_month = date(today.year, today.month, 1)
    new_employees_this_month = db.query(Employee).filter(Employee.joining_date >= first_day_of_month).count()

    # Department distribution
    from sqlalchemy import func
    dept_distribution = db.query(
        Department.name, 
        func.count(Employee.id)
    ).join(Employee, Employee.department_id == Department.id, isouter=True).group_by(Department.name).all()

    # Growth chart (grouped by joining date month/year)
    growth_data = db.query(
        func.date_trunc('month', Employee.joining_date).label('month'),
        func.count(Employee.id)
    ).group_by('month').order_by('month').all()

    # Recent activities
    from app.models.models import ActivityLog, User
    recent_activities = db.query(ActivityLog).options(joinedload(ActivityLog.user)).order_by(ActivityLog.timestamp.desc()).limit(5).all()

    return {
        "total_employees": total_employees,
        "active_employees": active_employees,
        "new_employees_this_month": new_employees_this_month,
        "department_distribution": [{"department": row[0], "count": row[1]} for row in dept_distribution if row[0] is not None],
        "growth_data": [{"month": row[0].strftime("%Y-%m") if row[0] else "", "count": row[1]} for row in growth_data if row[0] is not None],
        "recent_activities": recent_activities
    }
