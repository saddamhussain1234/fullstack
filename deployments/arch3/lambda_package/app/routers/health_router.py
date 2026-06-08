from fastapi import APIRouter
from app.schemas import schemas

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=schemas.HealthResponse)
def health_check():
    return {"status": "UP"}
