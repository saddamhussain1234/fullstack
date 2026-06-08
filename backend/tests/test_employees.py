def test_employee_crud(client):
    # Log in as Manager (manager@company.com / manager123)
    login_resp = client.post("/api/auth/login", json={
        "email": "manager@company.com",
        "password": "manager123"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create a Department first (so employee can be linked)
    # Manager doesn't have create department access (only Admin)
    # Log in as Admin to create a department
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@company.com",
        "password": "admin123"
    })
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    dept_resp = client.post("/api/departments", json={
        "name": "Engineering",
        "description": "Tech group",
        "manager_name": "Sarah Connor"
    }, headers=admin_headers)
    assert dept_resp.status_code == 200
    dept_id = dept_resp.json()["id"]

    # 2. Create Employee (using Manager headers)
    emp_payload = {
        "employee_id": "EMP101",
        "first_name": "John",
        "last_name": "Connor",
        "email": "john.connor@resistance.org",
        "phone_number": "1234567890",
        "department_id": dept_id,
        "designation": "Leader",
        "salary": 150000.00,
        "joining_date": "2026-06-01",
        "address": "Underground Base",
        "city": "Los Angeles",
        "state": "California",
        "country": "USA",
        "postal_code": "90210",
        "profile_image_url": "https://example.com/john.jpg",
        "status": "Active",
        "ai_bio": "Future leader of humanity."
    }
    
    create_resp = client.post("/api/employees", json=emp_payload, headers=headers)
    assert create_resp.status_code == 201
    emp_data = create_resp.json()
    assert emp_data["id"] is not None
    assert emp_data["first_name"] == "John"
    emp_db_id = emp_data["id"]

    # 3. Read Employee
    get_resp = client.get(f"/api/employees/{emp_db_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["email"] == "john.connor@resistance.org"

    # 4. Update Employee
    update_payload = {"first_name": "John Updated", "salary": 160000.00}
    put_resp = client.put(f"/api/employees/{emp_db_id}", json=update_payload, headers=headers)
    assert put_resp.status_code == 200
    assert put_resp.json()["first_name"] == "John Updated"
    assert float(put_resp.json()["salary"]) == 160000.00

    # 5. List Employees
    list_resp = client.get("/api/employees?search=John", headers=headers)
    assert list_resp.status_code == 200
    assert list_resp.json()["total"] == 1
    assert list_resp.json()["items"][0]["first_name"] == "John Updated"

    # 6. Export to CSV
    export_resp = client.get("/api/employees/export", headers=headers)
    assert export_resp.status_code == 200
    assert "text/csv" in export_resp.headers["Content-Type"]
    assert "John Updated" in export_resp.text

    # 7. AI Bio generation (template-based fallback testing)
    ai_resp = client.post("/api/ai/generate-bio", json={
        "name": "Jane Doe",
        "designation": "AI Engineer",
        "department": "Engineering",
        "experience": "machine learning, large language models"
    }, headers=headers)
    assert ai_resp.status_code == 200
    assert "Jane Doe" in ai_resp.json()["bio"]
    assert "AI Engineer" in ai_resp.json()["bio"]

    # 8. Delete Employee
    del_resp = client.delete(f"/api/employees/{emp_db_id}", headers=headers)
    assert del_resp.status_code == 200
    
    # Verify deletion
    verify_resp = client.get(f"/api/employees/{emp_db_id}", headers=headers)
    assert verify_resp.status_code == 404
