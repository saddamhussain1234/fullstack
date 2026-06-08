import os
import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database.database import engine, Base, SessionLocal
from app.routers import (
    health_router,
    auth_router,
    employee_router,
    department_router,
    contact_router,
    ai_router,
    todo_router
)
from app.services.auth_service import seed_default_users

# Initialize FastAPI App
app = FastAPI(
    title="Office Record Manager Pro API",
    description="Enterprise-grade REST APIs for employee and office records management",
    version="1.0.0"
)

# CORS Middleware Configuration
# Allow local React frontend in dev and wildcard as a fallback
origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",  # CRA / Alternate default
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the front-end origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health_router.router)
app.include_router(auth_router.router)
app.include_router(employee_router.router)
app.include_router(department_router.router)
app.include_router(contact_router.router)
app.include_router(ai_router.router)
app.include_router(todo_router.router)

# Database Setup & Seeding on Startup
@app.on_event("startup")
def startup_db_setup():
    try:
        # Create database tables if they do not exist
        Base.metadata.create_all(bind=engine)
        
        # Seed default configurations and admin accounts
        db = SessionLocal()
        try:
            seed_default_users(db)
            print("Database initialized and default users seeded successfully.")
        finally:
            db.close()
    except Exception as e:
        print(f"Error during database startup setup: {e}")

# Centralized Error Handling
@app.exception_handler(Exception)
def global_exception_handler(request: Request, exc: Exception):
    # Log the full traceback or error info in production
    print(f"Unhandled Exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact the administrator."},
    )

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
