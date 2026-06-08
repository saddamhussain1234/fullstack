"""
AWS Lambda handler for Architecture 3: CloudFront + S3 + API GW + Lambda + EC2 DB
Uses Mangum to wrap the FastAPI ASGI app as an AWS Lambda handler.
"""
from mangum import Mangum
from app.main import app

# Mangum wraps the FastAPI ASGI app to run in Lambda
handler = Mangum(app, lifespan="off")
