import pytest

def get_auth_headers(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@company.com", "password": "admin123"}
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_todo(client):
    headers = get_auth_headers(client)
    response = client.post(
        "/api/todos",
        json={"title": "Test Task", "description": "This is a test todo item"},
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["description"] == "This is a test todo item"
    assert data["completed"] is False
    assert "id" in data

def test_list_todos(client):
    headers = get_auth_headers(client)
    # Create one
    client.post(
        "/api/todos",
        json={"title": "Task 1", "description": "Desc 1"},
        headers=headers
    )
    
    # List
    response = client.get("/api/todos", headers=headers)
    assert response.status_code == 200
    todos = response.json()
    assert len(todos) >= 1
    assert todos[0]["title"] == "Task 1"

def test_update_todo(client):
    headers = get_auth_headers(client)
    # Create one
    create_res = client.post(
        "/api/todos",
        json={"title": "Update Task", "completed": False},
        headers=headers
    )
    todo_id = create_res.json()["id"]
    
    # Update
    response = client.put(
        f"/api/todos/{todo_id}",
        json={"completed": True},
        headers=headers
    )
    assert response.status_code == 200
    assert response.json()["completed"] is True

def test_delete_todo(client):
    headers = get_auth_headers(client)
    # Create one
    create_res = client.post(
        "/api/todos",
        json={"title": "Delete Task"},
        headers=headers
    )
    todo_id = create_res.json()["id"]
    
    # Delete
    response = client.delete(f"/api/todos/{todo_id}", headers=headers)
    assert response.status_code == 200
    
    # Check it's gone
    list_res = client.get("/api/todos", headers=headers)
    todos = list_res.json()
    assert all(t["id"] != todo_id for t in todos)
