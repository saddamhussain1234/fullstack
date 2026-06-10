# Architecture 1: ECS Fargate (Frontend) + EC2 (Backend Container) + EC2 (Local DB)

This document provides a comprehensive technical breakdown and operational guide for **Architecture 1** of the Office Record Manager Pro application.

---

## 1. Architecture Overview

### Business Objective
The objective is to establish a secure, low-overhead containerized application environment that separates public client-side static asset serving from backend application processing, while minimizing database latency by keeping the database close to the backend.

### Problem Being Solved
Deploying full-stack applications on a single server leads to dependency conflicts (e.g., Python runtimes vs. Node/Web server configurations) and security risks. Compromising the public web page would expose the database. 
Architecture 1 solves this by:
*   **Decoupling the frontend**: Packaging the static frontend in an Nginx container served via Amazon ECS Fargate, removing direct client-side traffic management from the database host.
*   **Co-locating backend and database**: Running the backend container directly on the same EC2 instance as the database using the Linux host network, allowing low-latency database reads and writes.

### Advantages
1. **Low-Latency Database Interface**: Communication between backend container and database is local, avoiding network hops across VPCs.
2. **Simplified Deployment**: By running the backend and database on the same host, there is no need for complex VPC routing, transit gateways, or public DB IPs.
3. **Decoupled Frontend Scaling**: The presentation layer scales independently on serverless ECS Fargate without affecting backend server resources.

### Disadvantages
1. **Shared Resources**: The backend FastAPI container shares CPU and Memory with the PostgreSQL engine, creating risk of resource starvation during heavy processing.
2. **Single Point of Failure (SPOF)**: If the EC2 host goes offline, both the API and database are lost.
3. **High Blast Radius**: A compromise of the backend container could lead to local host access, exposing the raw database files.

### Suitable Use Cases
*   Proof of Concepts (PoC) and staging environments.
*   Internal-facing administrative applications with predictable, low-to-moderate traffic.
*   Cost-sensitive projects requiring high-performance database interactions without RDS overhead.

### Unsuitable Use Cases
*   High-availability production applications with millions of users.
*   Applications with unpredictable CPU/Memory spikes that could starve database queries.
*   Strict compliance/regulatory environments requiring database encryption at rest and isolated network tiers.

---

## 2. High-Level Architecture Diagram

```mermaid
graph TD
    Client[Browser / Client] -->|HTTP Port 80| ECS_ALB[ECS Fargate Frontend Pod]
    ECS_ALB -->|API Requests Port 8000| EC2_Instance[EC2 Instance: IP Host]
    
    subgraph ECS VPC
        ECS_ALB
    end

    subgraph Default VPC
        subgraph EC2 Instance Host
            Backend[Backend Container: Port 8000]
            Postgres[PostgreSQL 16 DB: Port 5432]
            
            Backend -->|Localhost TCP Port 5432| Postgres
        end
    end
```

---

## 3. Detailed Data Flow

1.  **Request Initiation**: A user types the public IP or DNS of the ECS Fargate Service in their browser on port `80`.
2.  **DNS Resolution**: Route53 or the AWS default DNS resolves the query to the public IP of the ECS Fargate task container.
3.  **Frontend Serving**: The Nginx web server inside the ECS Fargate task returns the static built index.html and Javascript assets to the client's browser.
4.  **API Requests**: The user interacts with the app (e.g. registers a user). The JS code running in the browser makes a POST request to `http://<EC2_PUBLIC_IP>:8000/api/auth/register`.
5.  **Host Entry**: The request enters the EC2 security group, passes through port `8000`, and hits the host network namespace.
6.  **Backend Processing**: The backend FastAPI container (running with host networking) processes the request and executes queries on `postgresql://postgres:postgres@localhost:5432/officedb`.
7.  **Database Response**: PostgreSQL processes the transactions locally on the file system and returns results to FastAPI.
8.  **Client Return**: FastAPI formats a JSON response and returns it to the client's browser.

---

## 4. Complete AWS Services Deep Dive

### 4.1 Amazon EC2 (Elastic Compute Cloud)
*   **What is it**: On-demand resizable virtual computing environments.
*   **Why used**: Hosts the backend FastAPI container and the local PostgreSQL database.
*   **Internal Mechanics**: Relies on Xen or Nitro hypervisors to slice physical host hardware into secure VM slices.
*   **Alternatives**: AWS Fargate for backend, Amazon RDS for PostgreSQL.
*   **Pricing**: Pay-per-hour based on instance size.
*   **Scaling**: Manual resize, or Auto Scaling Group (ASG) behind a load balancer.

### 4.2 Amazon ECS (Elastic Container Service) & AWS Fargate
*   **What is it**: Container orchestration system; Fargate is the serverless compute engine.
*   **Why used**: Runs the frontend container without managing underlying virtual machine hosts.
*   **Internal Mechanics**: Fargate allocates dedicated MicroVMs using Firecracker for each task execution.
*   **Alternatives**: Amazon EKS, AWS App Runner.
*   **Pricing**: Billed based on vCPU and Memory allocated per second of task runtime.

### 4.3 AWS ECR (Elastic Container Registry)
*   **What is it**: Managed private container registry.
*   **Why used**: Stores and registers compiled Docker images for the frontend and backend.

---

## 5. Networking Deep Dive

### Concepts & Subnets
*   **VPC**: Virtual Private Cloud containing all resources.
*   **Subnets**: We configure the ECS frontend tasks in public subnets with public IP routing enabled to ensure clients can download the static files.
*   **Security Groups**: 
    *   **ECS SG**: Inbound TCP Port 80 from `0.0.0.0/0`.
    *   **EC2 SG**: Inbound TCP Port 22 (SSH) from administration IP, Port 8000 (API) from `0.0.0.0/0`, and Port 5432 (Postgres) restricted.

---

## 6. Container Deep Dive

### What is Docker?
Docker isolated runtime namespaces allow sandboxing application contexts.

### Container Lifecycle
1.  **Build**: Dockerfile commands create read-only layers.
2.  **Ship**: Registry pushes/pulls images.
3.  **Run**: Images run as writeable container instances using host kernel groups.

---

## 7. Database Deep Dive

*   **Database**: PostgreSQL 16.
*   **Authentication**: Configured in `pg_hba.conf` using `trust` for local loopback (`127.0.0.1/32` or `localhost`).
*   **Data Durability**: Relies on EC2 host block storage (EBS). Backups must be manually scripted using `pg_dump` and pushed to S3.

---

## 8. Command-by-Command Explanation

### 1. Configure postgresql.conf
*   **Command**: `sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/16/main/postgresql.conf`
*   **Syntax**: `sed -i` performs in-place replacement.
*   **Internal action**: Configures PostgreSQL to bind and listen on all available host network interfaces instead of just localhost.

### 2. Run Backend Container
*   **Command**:
    ```bash
    sudo docker run -d --name office-backend --network host --restart always -e DATABASE_URL=postgresql://postgres:postgres@localhost:5432/officedb office-backend:latest
    ```
*   **Flags**:
    *   `-d`: Run in detached background daemon mode.
    *   `--network host`: Bypasses Docker bridge networking; binds ports directly to EC2 interfaces.
    *   `-e`: Sets container OS environment variables.

---

## 9. Configuration File Deep Dive

### `ecs-frontend-task.json`
*   `family`: Defines the task classification group name.
*   `networkMode: awsvpc`: Every Fargate task gets its own Elastic Network Interface (ENI) and unique private IP.
*   `containerDefinitions`: Array specifying container image, CPU bounds, memory bounds, and log configurations.

---

## 10. Deployment Process

1.  **Step 1: EC2 Inception**: Spin up EC2 Ubuntu instance.
2.  **Step 2: Database Initialization**: Install PostgreSQL 16 and seed data.
3.  **Step 3: Backend Compilation**: Install Docker, clone code, build, and run using `--network host`.
4.  **Step 4: Frontend Compilation**: Compile React using the EC2 IP as an argument, push to ECR.
5.  **Step 5: ECS Execution**: Register task definition and launch Fargate service.

---

## 11. Validation and Testing
*   **Health Check**:
    ```bash
    curl -X GET "http://<EC2_PUBLIC_IP>:8000/health"
    ```
*   **Successful response**: `{"status": "ok"}` or `{"status": "UP"}`.

---

## 12. Troubleshooting Handbook

*   **Problem**: Cannot connect to Database from Backend Container.
    *   **Root Cause**: Localhost loopback mismatch if using Docker bridge network instead of host networking.
    *   **Fix**: Add `--network host` to docker run or use target host IP.

---

## 13. Security Deep Dive
*   Ensure password values are hashed via bcrypt.
*   Do not publish credentials inside codebase manifests. Use environment variables.

---

## 14. Monitoring and Logging
*   ECS logs route to AWS CloudWatch `/ecs/office-frontend`.
*   Backend logs inspectable via `docker logs office-backend`.

---

## 15. Cost Analysis
*   **EC2 host**: $8.50/month (t3.micro).
*   **ECS Fargate task**: ~$10.00/month (0.25 vCPU, 0.5GB).
*   **Total Cost**: ~$18.50/month. Great for dev!

---

## 16. Interview Preparation Section
*   *Q: Why use host networking for the backend container?*
    *   *A*: It avoids bridge network routing latency and maps localhost connections from the container directly to the PostgreSQL instance running on the host OS loopback.

---

## 17. Beginner Learning Path
1.  Learn Basic Linux file navigation.
2.  Learn basic Docker runs.
3.  Learn SQL configurations.
4.  Understand AWS VPC fundamentals.

---

## 18. Key Takeaways
*   Avoid single EC2 point of failure for production.
*   Store database backups externally (e.g. S3).
*   Keep frontend and backend code isolated.
