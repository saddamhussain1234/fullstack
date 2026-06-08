# Office Record Manager Pro

Office Record Manager Pro is an enterprise-grade, secure, and modern Full Stack Employee & Office Record Management Platform. It enables organizations to manage employee files, department rosters, office contact directories, and automatically generate professional employee corporate summaries via an AI Integration Layer (OpenAI with template-based offline fallbacks).

---

## 🏗️ Project Architecture

The architecture follows a clean, decoupled client-server model with repository-service layering on the backend.

```mermaid
graph TD
    Client[React Frontend / SPA] -->|HTTP REST + Bearer JWT| Gateway[FastAPI Backend / Uvicorn]
    Gateway -->|CORS / Middleware| Router[API Routers]
    Router -->|RBAC Guard| Service[Service Layer]
    Service -->|AI Summaries| AIService[AI Service / OpenAI or Template Fallback]
    Service -->|Database Queries| Repo[Repository Layer]
    Repo -->|ORM Mapping| DB[(PostgreSQL Database)]
    Repo -.->|Activity & Audit Logging| Audit[Activity/Audit Logs]
```

---

## 📁 Repository Structure

```
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── database/         # Database Engine & Connection Session
│   │   ├── middleware/       # JWT RBAC Guards
│   │   ├── models/           # SQLAlchemy DB Models
│   │   ├── repositories/     # Database Queries (CRUD, Paging, Search)
│   │   ├── routers/          # REST API Controllers
│   │   ├── schemas/          # Pydantic Data Validation Schemas
│   │   ├── services/         # Business Logic (CSV Builder, Hashing, AI)
│   │   └── main.py           # Application Gateway Entrypoint
│   ├── tests/                # Pytest Suite (In-Memory SQLite Tests)
│   ├── Dockerfile            # Container build for FastAPI
│   └── requirements.txt      # Python Dependencies
├── database/
│   └── init.sql              # Database Tables Schema & Seeds
├── frontend/                 # React Vite SPA
│   ├── src/
│   │   ├── components/       # Layouts (Sidebar, Navbar, Cards)
│   │   ├── context/          # Authentication context (JWT Refresh flow)
│   │   ├── pages/            # Page Views (Dashboard, Login, CRUDs)
│   │   ├── utils/            # Axios API instances & Interceptors
│   │   ├── App.jsx           # Routing & Routing Guards
│   │   └── main.jsx          # React Bootstrapper
│   ├── nginx.conf            # Custom Nginx server configuration (SPA Router)
│   └── Dockerfile            # Multi-stage production container build
└── docker-compose.yml        # Multi-container orchestration configurations
```

---

## 🔐 Security & RBAC Roles

The application implements JWT authentication with refresh token rotation.
*   **Admin**: Full access. View dashboard, manage employees, add/edit/delete departments, manage contact lists, and run audits.
*   **Manager**: Manage employees (CRUD), manage contacts list (CRUD), view dashboard/departments.
*   **Employee**: Read-only access to employee directory, departments, and contacts.

### Default Seed Credentials:
*   **Admin**: `admin@company.com` / `admin123`
*   **Manager**: `manager@company.com` / `manager123`
*   **Employee**: `employee@company.com` / `employee123`

---

## ⚡ Local Development Quickstart

### Prerequisites
*   Python 3.10+
*   Node.js 18+
*   PostgreSQL 14+ (if running locally without Docker)

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in a `.env` file inside the `backend` folder:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/officedb
   JWT_SECRET_KEY=supersecretkeyofficemanagerpro12345
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   OPENAI_API_KEY=your-api-key-here
   ```
5. Run the server locally:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` folder:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## 🐳 Docker Production Setup (Recommended)

To run the complete production-ready containerized cluster including PostgreSQL, FastAPI, and React (served by Nginx), execute a single command from the root workspace:

```bash
docker compose up -d --build
```

### Access Ports:
*   **Frontend Client**: `http://localhost:3000` (Redirects automatically to Nginx web root)
*   **Backend API Services**: `http://localhost:8000`
*   **OpenAPI/Swagger Interactive Sandbox**: `http://localhost:8000/docs`
*   **Postgres DB Node**: `localhost:5432`

---

## 🧪 Testing Backend Operations

To execute the test suite (uses an in-memory SQLite backend setup for zero-configuration, high-speed execution):
```bash
cd backend
pytest tests
```

---

## 🌐 AWS Deployment Guide (Enterprise-Ready)

The codebase is built with 12-Factor App design principles and can be deployed natively across multiple AWS topologies:

### Architecture 1: React Frontend on ECS (Fargate) + FastAPI Backend on EC2 + PostgreSQL on RDS
*   **Frontend**: Built as a Docker image, hosted on Amazon Elastic Container Registry (ECR), and executed on Amazon ECS (Fargate) behind an Application Load Balancer (ALB).
*   **Backend**: Deployed to EC2 instances inside an Auto Scaling Group, managed via AWS Systems Manager, behind the same ALB (using path-based routing `/api/*`).
*   **Database**: Multi-AZ PostgreSQL database instances deployed on Amazon RDS.

### Architecture 2: React Frontend on EC2 + FastAPI Backend on Elastic Beanstalk + PostgreSQL on RDS
*   **Frontend**: Static files served using Nginx on an EC2 instance.
*   **Backend**: Managed through AWS Elastic Beanstalk Docker platform, which handles automatic provisioning, load balancing, and scaling.
*   **Database**: Managed via Amazon RDS PostgreSQL.

### Architecture 3: React Frontend on S3 + CloudFront + API Gateway + Python Lambda + RDS
*   **Frontend**: React assets built (`dist/`) and copied to an S3 bucket configured for static website hosting. Distributed globally via Amazon CloudFront (CDN).
*   **Backend**: Lambda functions (running FastAPI with adapter like `mangum`), exposed via Amazon API Gateway HTTP API.
*   **Database**: Amazon RDS Serverless v2 PostgreSQL.

### Architecture 4: React Frontend on EKS + FastAPI Backend on ECS + PostgreSQL on RDS
*   **Frontend**: Hosted as Kubernetes pods inside Amazon EKS, scaled via Horizontal Pod Autoscaler.
*   **Backend**: Deployed on Amazon ECS using AWS Fargate serverless compute.
*   **Database**: Amazon RDS Multi-AZ DB Cluster.

### Architecture 5: React Frontend on Beanstalk + FastAPI Backend on EKS + PostgreSQL on RDS
*   **Frontend**: Configured on AWS Elastic Beanstalk Node environment.
*   **Backend**: Executed inside an Amazon EKS Kubernetes Cluster using ALB Ingress Controller.
*   **Database**: Amazon RDS database instances.

---

## 📖 API Documentation & cURL Operations

FastAPI automatically compiles OpenAPI descriptions. View the Swagger interactive workspace at `http://localhost:8000/docs` or the alternative ReDoc documentation at `http://localhost:8000/redoc`.

### cURL Samples:

#### 1. API Health Check
```bash
curl -X GET "http://localhost:8000/health"
```

#### 2. User Authentication (Login)
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@company.com", "password": "admin123"}'
```
*   *Response returns `"access_token"`. Copy it to use in subsequent requests as `Authorization: Bearer <token>`.*

#### 3. Create Department (Admin Role Required)
```bash
curl -X POST "http://localhost:8000/api/departments" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
     -d '{"name": "Operations", "description": "Daily logistics", "manager_name": "Rick Sanchez"}'
```

#### 4. Onboard Employee (Manager/Admin Role Required)
```bash
curl -X POST "http://localhost:8000/api/employees" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
     -d '{
       "employee_id": "EMP505",
       "first_name": "Morty",
       "last_name": "Smith",
       "email": "morty.smith@company.com",
       "phone_number": "555-0199",
       "department_id": 1,
       "designation": "Junior Assistant",
       "salary": 45000.00,
       "joining_date": "2026-06-01"
     }'
```

#### 5. List Employees with Searching and Paging
```bash
curl -X GET "http://localhost:8000/api/employees?search=Morty&page=1&size=10" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

#### 6. Generate AI Biography for Profile Summary (Manager/Admin Required)
```bash
curl -X POST "http://localhost:8000/api/ai/generate-bio" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
     -d '{
       "name": "Morty Smith",
       "designation": "Junior Assistant",
       "department": "Operations",
       "experience": "basic portal gun navigation, logistics, and data entering"
     }'
```

---

## 🛠️ Troubleshooting Guide

### 1. Database Connection Failures
*   **Symptoms**: Backend crashes on startup with `psycopg2.OperationalError` / `Connection refused`.
*   **Fix**: If running in Docker, ensure the `db` container is fully healthy before the backend boots (handled automatically by `docker-compose.yml` healthcheck dependency). If running locally, check that PostgreSQL is running and you can connect via pgAdmin or psql, and that your `DATABASE_URL` matches your local credentials.

### 2. Frontend 404 on Page Refreshes
*   **Symptoms**: Refreshing the browser on paths like `/employees` or `/profile` shows an Nginx 404 page inside Docker.
*   **Fix**: Nginx defaults to looking for file structures mapping to the URL. The React Single Page Application must rewrite all virtual route requests to `index.html`. Verify that `nginx.conf` has the line `try_files $uri $uri/ /index.html;` active and that it has been copied into `/etc/nginx/conf.d/default.conf` in the Dockerfile.

### 3. JWT Expiration issues
*   **Symptoms**: API queries fail with 401 Unauthorized after 60 minutes.
*   **Fix**: The Axios client in `frontend/src/utils/api.js` is equipped with response interceptors. If a 401 occurs, it automatically submits the stored `refresh_token` to `/api/auth/refresh` to obtain a new token pair and retries the original request silently. Ensure the refresh token is valid and present in localStorage.
