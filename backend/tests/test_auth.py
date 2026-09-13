import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.security.password import hash_password

def test_login_success(client: TestClient, db: Session):
    # Setup test user
    test_email = "test.principal@campus.edu"
    test_password = "SecurePassword123!"
    
    user = User(
        email=test_email,
        full_name="Test Principal",
        role=UserRole.PRINCIPAL,
        hashed_password=hash_password(test_password),
        is_active=True
    )
    db.add(user)
    db.commit()

    # Attempt login
    response = client.post(
        "/api/v1/auth/login",
        json={"email": test_email, "password": test_password}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    
    # Check that refresh cookie is set
    assert "campus_intel_refresh" in response.cookies

def test_login_failure(client: TestClient, db: Session):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@campus.edu", "password": "wrongpassword"}
    )
    
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["message"]

def test_dashboard_role_gating_principal(client: TestClient, db: Session):
    # Create an HOD user and try to access Principal dashboard
    hod_email = "test.hod@campus.edu"
    hod_password = "Password123!"
    
    user = User(
        email=hod_email,
        full_name="Test HOD",
        role=UserRole.HOD,
        hashed_password=hash_password(hod_password),
        is_active=True
    )
    db.add(user)
    db.commit()

    # Login to get token
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": hod_email, "password": hod_password}
    )
    token = login_res.json()["access_token"]
    
    # Try accessing principal dashboard
    response = client.get(
        "/api/v1/dashboard/principal",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 403
    assert "permission" in response.json()["message"].lower()

def test_dashboard_role_gating_success(client: TestClient, db: Session):
    # Try accessing HOD dashboard as HOD
    hod_email = "test.hod2@campus.edu"
    hod_password = "Password123!"
    
    user = User(
        email=hod_email,
        full_name="Test HOD 2",
        role=UserRole.HOD,
        department="Computer Science",
        hashed_password=hash_password(hod_password),
        is_active=True
    )
    db.add(user)
    db.commit()

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": hod_email, "password": hod_password}
    )
    token = login_res.json()["access_token"]
    
    response = client.get(
        "/api/v1/dashboard/hod",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    assert response.json()["dashboard"] == "hod"
