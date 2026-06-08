#!/bin/bash
# Update system and install Docker
dnf update -y
dnf install docker -y
systemctl enable docker
systemctl start docker

# Add permission helper for AWS CLI
dnf install aws-cli -y

# Retrieve credentials and log in to ECR (using the EC2 instance role)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 203557140324.dkr.ecr.us-east-1.amazonaws.com

# Pull the backend image
docker pull 203557140324.dkr.ecr.us-east-1.amazonaws.com/backend-app:latest

# Run the backend container
docker run -d \
  --name office-backend \
  -p 8000:8000 \
  --restart always \
  -e DATABASE_URL=postgresql://postgres:postgres@172.31.47.210:5432/officedb \
  -e JWT_SECRET_KEY=supersecretkeyofficemanagerpro12345 \
  -e JWT_ALGORITHM=HS256 \
  -e ACCESS_TOKEN_EXPIRE_MINUTES=60 \
  203557140324.dkr.ecr.us-east-1.amazonaws.com/backend-app:latest
