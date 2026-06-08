# Architecture 1: ECS (Frontend) + EC2 (Backend) + same EC2 (DB Layer)

This document provides a clear-cut explanation and step-by-step guide for deploying the Full-Stack Office Record Manager Pro application under the first architecture.

```mermaid
graph TD
    Client[Browser / Client] -->|Port 80| ECS[ECS Fargate Frontend Container]
    ECS -->|API Requests - Port 8000| EC2Backend[EC2 Instance: Backend Container]
    EC2Backend -->|Database Queries - Port 5432| Postgres[EC2 Instance: PostgreSQL 16 DB]
```

---

## 🌐 Network Configuration & Ports

*   **Database (PostgreSQL):** Runs natively on the EC2 host. Listens on all interfaces (`*`) on Port `5432`.
*   **Backend (FastAPI):** Runs inside a Docker container using the **Host Network** on the same EC2 instance. Listens on Port `8000`.
*   **Frontend (React/Nginx):** Runs as an ECS Fargate service in an AWS VPC. Exposes Port `80`.

---

## 🛠️ Detailed Implementation Steps

### Step 1: Setup the Database (EC2 Ubuntu Host)

1.  **Launch the EC2 Instance:**
    *   **AMI:** Ubuntu 22.04 LTS (or Ubuntu 24.04 LTS).
    *   **Instance Type:** `t3.micro` (free-tier eligible).
    *   **Security Group (`office-backend-db-sg`) Inbound Rules:**
        *   **SSH (Port 22):** Source: `My IP` (for secure command access).
        *   **HTTP/Custom TCP (Port 8000):** Source: `0.0.0.0/0` (allowing frontend client traffic).
        *   **PostgreSQL (Port 5432):** Source: `0.0.0.0/0` (or restricted to your subnet).
2.  **Configure PostgreSQL 16:**
    *   On the Ubuntu EC2 instance terminal:
        ```bash
        # 1. Allow connections from any IP in postgresql.conf
        sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/16/main/postgresql.conf
        
        # 2. Grant connection rights in pg_hba.conf
        sudo sh -c 'echo "host all all 0.0.0.0/0 trust" >> /etc/postgresql/16/main/pg_hba.conf'
        
        # 3. Restart Postgres
        sudo systemctl restart postgresql
        
        # 4. Set password and create application database
        sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
        sudo -u postgres psql -c "CREATE DATABASE officedb;"
        ```
3.  **Seed Database Schema:**
    *   Copy and paste the `CREATE TABLE` and `INSERT` queries from [userdata_db.sh](file:///d:/fullstack/userdata_db.sh) into the PostgreSQL console.

---

### Step 2: Build & Run the Backend Container (EC2 Host)

1.  **Install Docker on EC2:**
    ```bash
    sudo apt-get update -y
    sudo apt-get install docker.io -y
    sudo systemctl enable --now docker
    ```
2.  **Clone code repository on EC2:**
    ```bash
    git clone https://github.com/saddamhussain1234/fullstack.git
    cd fullstack/backend
    ```
3.  **Build the Backend Docker image:**
    ```bash
    sudo docker build -t office-backend:latest .
    ```
4.  **Run the Backend using host networking:**
    *   *Note: Using `--network host` ensures `localhost:5432` maps directly to the host's PostgreSQL service, and automatically binds port `8000` to the EC2 Public IP.*
    ```bash
    sudo docker run -d \
      --name office-backend \
      --network host \
      --restart always \
      -e DATABASE_URL=postgresql://postgres:postgres@localhost:5432/officedb \
      -e JWT_SECRET_KEY=supersecretkeyofficemanagerpro12345 \
      -e JWT_ALGORITHM=HS256 \
      -e ACCESS_TOKEN_EXPIRE_MINUTES=60 \
      -e GROQ_API_KEY=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 \
      office-backend:latest
    ```
5.  **Verify Logs:**
    ```bash
    sudo docker logs office-backend
    ```

---

### Step 3: Build & Push Frontend Image (Local Machine)

1.  **Authenticate local Docker CLI with ECR:**
    ```bash
    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 542119827880.dkr.ecr.us-east-1.amazonaws.com
    ```
2.  **Create Private ECR Repository (if not existing):**
    ```bash
    aws ecr create-repository --repository-name frontendrepo --region us-east-1
    ```
3.  **Build and Push the Frontend Image:**
    *   *Note: Replace `<YOUR_EC2_PUBLIC_IP>` with the public IP/DNS of your EC2 backend.*
    ```bash
    cd frontend
    
    # Compile with EC2 backend API url
    docker build --build-arg VITE_API_URL=http://<YOUR_EC2_PUBLIC_IP>:8000 -t frontendrepo:latest .
    
    # Tag and Push
    docker tag frontendrepo:latest 542119827880.dkr.ecr.us-east-1.amazonaws.com/frontendrepo:latest
    docker push 542119827880.dkr.ecr.us-east-1.amazonaws.com/frontendrepo:latest
    ```

---

### Step 4: Run Frontend Container on ECS Fargate (AWS Console)

1.  **Create ECS Fargate Cluster:**
    *   Open **ECS** -> **Clusters** -> **Create cluster**.
    *   Name: `office-records-cluster`.
    *   Infrastructure: **AWS Fargate**.
2.  **Create CloudWatch Log Group:**
    *   To allow logs collection, open **CloudWatch** -> **Log groups** -> **Create log group**.
    *   Name: `/ecs/office-frontend` (matches the task definition logging configuration).
3.  **Register Task Definition:**
    *   In ECS, click **Task Definitions** -> **Create new task definition with JSON**.
    *   Paste [ecs-frontend-task.json](file:///d:/fullstack/deployments/arch1/ecs-frontend-task.json) updated with your ECR image path:
    ```json
    {
      "family": "office-frontend-task",
      "networkMode": "awsvpc",
      "requiresCompatibilities": ["FARGATE"],
      "cpu": "256",
      "memory": "512",
      "executionRoleArn": "arn:aws:iam::542119827880:role/ecsTaskExecutionRole",
      "containerDefinitions": [
        {
          "name": "office-frontend",
          "image": "542119827880.dkr.ecr.us-east-1.amazonaws.com/frontendrepo:latest",
          "portMappings": [
            {
              "containerPort": 80,
              "protocol": "tcp"
            }
          ],
          "essential": true,
          "logConfiguration": {
            "logDriver": "awslogs",
            "options": {
              "awslogs-group": "/ecs/office-frontend",
              "awslogs-region": "us-east-1",
              "awslogs-stream-prefix": "ecs"
            }
          }
        }
      ]
    }
    ```
4.  **Create ECS Service:**
    *   In the cluster page, click **Services** -> **Create**.
    *   Launch Type: **FARGATE**
    *   Task Definition: `office-frontend-task`
    *   Service Name: `office-frontend-service`
    *   Desired Tasks: `1`
    *   **Networking:**
        *   Subnets: Choose default public subnets.
        *   Security Group: Create new, allowing **Port 80 (HTTP)** from `0.0.0.0/0`.
        *   Public IP: **Enabled**.
    *   Deploy the service.

---

## 🧪 Verification Plan

### 1. Test Backend API (via cURL)
Verify endpoint connectivity and user authentication database logic:
```bash
# Verify Health Check
curl -X GET "http://<YOUR_EC2_PUBLIC_IP>:8000/health"

# Test Admin login
curl -X POST "http://<YOUR_EC2_PUBLIC_IP>:8000/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@company.com", "password": "admin123"}'
```

### 2. Test Frontend Interface (via Browser)
1. Find your ECS task's **Public IP** inside your ECS Service's **Tasks** tab.
2. Open `http://<ECS_TASK_PUBLIC_IP>` in your browser.
3. Log in as `admin@company.com` / `admin123`.
4. Verify you can successfully view dashboard metrics, add new employees, and request AI biography generations.
