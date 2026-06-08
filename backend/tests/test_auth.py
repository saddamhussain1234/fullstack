def test_login_success(client):
    response = client.post("/api/auth/login", json={
        "email": "admin@company.com",
        "password": "admin123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "admin@company.com"
    assert data["user"]["role"]["name"] == "Admin"

def test_login_invalid_credentials(client):
    response = client.post("/api/auth/login", json={
        "email": "admin@company.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 400
    assert response.json()["detail"] == "Incorrect email or password"

def test_refresh_token(client):
    # Log in first
    login_resp = client.post("/api/auth/login", json={
        "email": "admin@company.com",
        "password": "admin123"
    })
    refresh_token = login_resp.json()["refresh_token"]

    # Refresh token
    refresh_resp = client.post("/api/auth/refresh", json={
        "refresh_token": refresh_token
    })
    assert refresh_resp.status_code == 200
    data = refresh_resp.json()
    assert "access_token" in data
    assert "refresh_token" in data

def test_rbac_admin_vs_employee(client):
    # Log in as employee
    emp_login = client.post("/api/auth/login", json={
        "email": "employee@company.com",
        "password": "employee123"
    })
    emp_token = emp_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {emp_token}"}

    # Attempt to post a department (Requires Admin)
    dept_resp = client.post("/api/departments", json={
        "name": "R&D",
        "description": "Research and development",
        "manager_name": "Dr. Frankenstein"
    }, headers=headers)
    
    assert dept_resp.status_code == 403
    assert "Access denied" in dept_resp.json()["detail"]
