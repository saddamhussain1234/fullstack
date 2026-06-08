from fastapi import APIRouter, Depends
from app.schemas import schemas
from app.services.ai_service import ai_service
from app.middleware import auth_middleware

router = APIRouter(prefix="/api/ai", tags=["AI Integration"])

@router.post("/generate-bio", response_model=schemas.AIBioResponse)
def generate_bio(
    req: schemas.AIBioRequest,
    current_user: auth_middleware.User = Depends(auth_middleware.require_manager)
):
    bio_content = ai_service.generate_employee_bio(
        name=req.name,
        designation=req.designation,
        department=req.department,
        experience=req.experience
    )
    return {"bio": bio_content}
