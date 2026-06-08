from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas import schemas
from app.services import auth_service
from app.middleware import auth_middleware
from app.utils.audit_logger import log_activity

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=schemas.Token)
def login(login_req: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, login_req.email, login_req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    
    # Generate tokens
    access_token = auth_service.create_access_token(
        data={"sub": user.email, "role": user.role.name, "user_id": user.id}
    )
    refresh_token = auth_service.create_refresh_token(
        data={"sub": user.email, "role": user.role.name, "user_id": user.id}
    )

    # Log user login action
    log_activity(db, user.id, "USER_LOGIN", f"User logged in successfully: {user.email}")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/refresh", response_model=schemas.Token)
def refresh(refresh_req: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = auth_service.decode_token(refresh_req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    email = payload.get("sub")
    user = db.query(auth_middleware.User).filter(auth_middleware.User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Generate new tokens
    new_access_token = auth_service.create_access_token(
        data={"sub": user.email, "role": user.role.name, "user_id": user.id}
    )
    new_refresh_token = auth_service.create_refresh_token(
        data={"sub": user.email, "role": user.role.name, "user_id": user.id}
    )

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/logout")
def logout(
    current_user: auth_middleware.User = Depends(auth_middleware.get_current_user),
    db: Session = Depends(get_db)
):
    log_activity(db, current_user.id, "USER_LOGOUT", f"User logged out successfully: {current_user.email}")
    return {"message": "Successfully logged out"}
