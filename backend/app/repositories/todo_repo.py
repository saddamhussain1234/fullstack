from sqlalchemy.orm import Session
from app.models.models import Todo
from typing import List, Optional

def get_todo_by_id(db: Session, todo_id: int, user_id: int) -> Optional[Todo]:
    return db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == user_id).first()

def list_todos(db: Session, user_id: int) -> List[Todo]:
    return db.query(Todo).filter(Todo.user_id == user_id).order_by(Todo.created_at.desc()).all()

def create_todo(db: Session, todo_data: dict, user_id: int) -> Todo:
    db_todo = Todo(**todo_data, user_id=user_id)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

def update_todo(db: Session, db_todo: Todo, update_data: dict) -> Todo:
    for key, value in update_data.items():
        if value is not None:
            setattr(db_todo, key, value)
    db.commit()
    db.refresh(db_todo)
    return db_todo

def delete_todo(db: Session, db_todo: Todo) -> bool:
    db.delete(db_todo)
    db.commit()
    return True
