from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas import schemas
from app.repositories import todo_repo
from app.middleware import auth_middleware
from app.utils.audit_logger import log_activity, log_audit
from typing import List

router = APIRouter(prefix="/api/todos", tags=["Todos"])

@router.get("", response_model=List[schemas.TodoResponse])
def get_todos(
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_employee)
):
    return todo_repo.list_todos(db, current_user.id)

@router.post("", response_model=schemas.TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(
    todo_in: schemas.TodoCreate,
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_employee)
):
    todo_data = todo_in.model_dump()
    db_todo = todo_repo.create_todo(db, todo_data, current_user.id)
    
    log_activity(db, current_user.id, "CREATE_TODO", f"Created todo: '{db_todo.title}'")
    
    return db_todo

@router.put("/{id}", response_model=schemas.TodoResponse)
def update_todo(
    id: int,
    todo_in: schemas.TodoUpdate,
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_employee)
):
    db_todo = todo_repo.get_todo_by_id(db, id, current_user.id)
    if not db_todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo item with ID {id} not found"
        )
        
    todo_data = todo_in.model_dump(exclude_unset=True)
    updated_todo = todo_repo.update_todo(db, db_todo, todo_data)
    
    log_activity(db, current_user.id, "UPDATE_TODO", f"Updated todo: '{updated_todo.title}'")
    
    return updated_todo

@router.delete("/{id}")
def delete_todo(
    id: int,
    db: Session = Depends(get_db),
    current_user: auth_middleware.User = Depends(auth_middleware.require_employee)
):
    db_todo = todo_repo.get_todo_by_id(db, id, current_user.id)
    if not db_todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo item with ID {id} not found"
        )
        
    todo_repo.delete_todo(db, db_todo)
    log_activity(db, current_user.id, "DELETE_TODO", f"Deleted todo: '{db_todo.title}'")
    
    return {"message": "Todo item successfully deleted"}
