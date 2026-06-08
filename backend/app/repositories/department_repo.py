from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Department, Employee
from typing import List, Tuple, Optional

def get_departments_with_counts(db: Session) -> List[Tuple[Department, int]]:
    # Query departments and count associated employees
    results = db.query(
        Department,
        func.count(Employee.id).label("employee_count")
    ).outerjoin(Employee, Employee.department_id == Department.id)\
     .group_by(Department.id).all()
    return results

def get_department_by_id(db: Session, department_id: int) -> Optional[Department]:
    return db.query(Department).filter(Department.id == department_id).first()

def get_department_by_name(db: Session, name: str) -> Optional[Department]:
    return db.query(Department).filter(Department.name == name).first()

def create_department(db: Session, department_data: dict) -> Department:
    db_dept = Department(**department_data)
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept

def update_department(db: Session, db_dept: Department, update_data: dict) -> Department:
    for key, value in update_data.items():
        setattr(db_dept, key, value)
    db.commit()
    db.refresh(db_dept)
    return db_dept

def delete_department(db: Session, db_dept: Department) -> bool:
    db.delete(db_dept)
    db.commit()
    return True
