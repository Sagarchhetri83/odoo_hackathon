from fastapi.testclient import TestClient
import pytest
from unittest.mock import patch
from datetime import datetime, timedelta

from ..app.main import app
from ..app.database import Base, get_db
from ..app import models

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# Assuming `client` and `db_session` fixtures are provided by conftest.py

# A known OTP for testing purposes
TEST_OTP = "123456"

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)  # Create tables in test database


@app.on_event("shutdown")
def shutdown_event():
    Base.metadata.drop_all(bind=engine)  # Drop tables after tests


def override_get_db():
    try:
        db = SessionTesting()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_create_user(client: TestClient):
    response = client.post(
        "/auth/signup",
        json={"email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data

def test_create_existing_user(client: TestClient):
    # Ensure user exists from previous test or create it
    client.post(
        "/auth/signup",
        json={"email": "test@example.com", "password": "password123"},
    )
    response = client.post(
        "/auth/signup",
        json={"email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "Email already registered"}

def test_login_for_access_token(client: TestClient):
    # Ensure user exists
    client.post(
        "/auth/signup",
        json={"email": "login@example.com", "password": "password123"},
    )
    response = client.post(
        "/auth/login",
        json={"email": "login@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client: TestClient):
    response = client.post(
        "/auth/login",
        json={"email": "wrong@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid Credentials"}

@patch('backend.app.utils.generate_otp', return_value=TEST_OTP)
@patch('backend.app.utils.redis_client')
def test_request_reset_otp(mock_redis_client, mock_generate_otp, client: TestClient):
    # Ensure user exists
    client.post(
        "/auth/signup",
        json={"email": "otp@example.com", "password": "password123"},
    )

    response = client.post(
        "/auth/request-reset-otp",
        json={"email": "otp@example.com"},
    )
    assert response.status_code == 200
    assert response.json() == {"message": "If a matching account is found, an OTP has been sent to your email.", "status": "success"}
    
    # Verify that generate_otp was called
    mock_generate_otp.assert_called_once()
    
    # Verify that OTP was set in Redis (mocked)
    # We need to ensure that `hash_otp` is called correctly before `setex`
    # The actual `setex` in `auth.py` receives the *hashed* OTP
    from backend.app.utils import hash_otp # Import directly to call the real function
    expected_hashed_otp = hash_otp(TEST_OTP) # Hash the known OTP as it would be in production

    mock_redis_client.setex.assert_called_once()
    args, kwargs = mock_redis_client.setex.call_args
    assert args[0] == f"otp:otp@example.com"
    # The stored value should be the hashed OTP. Compare after decoding if necessary.
    assert args[1] == timedelta(minutes=5) # TTL
    assert args[2] == expected_hashed_otp # Hashed OTP
    

@patch('backend.app.utils.generate_otp', return_value=TEST_OTP)
@patch('backend.app.utils.redis_client')
def test_verify_reset_otp(mock_redis_client, mock_generate_otp, client: TestClient):
    # Ensure user exists
    client.post(
        "/auth/signup",
        json={"email": "verifyotp@example.com", "password": "password123"},
    )

    # Simulate sending an OTP
    from backend.app.utils import hash_otp
    hashed_test_otp = hash_otp(TEST_OTP)
    mock_redis_client.get.return_value = hashed_test_otp

    response = client.post(
        "/auth/verify-reset-otp",
        json={"email": "verifyotp@example.com", "otp_code": TEST_OTP},
    )
    assert response.status_code == 200
    assert response.json()["message"] == "OTP verified successfully"
    assert "reset_token" in response.json()
    
    mock_redis_client.get.assert_called_with(f"otp:verifyotp@example.com")
    mock_redis_client.delete.assert_called_with(f"otp:verifyotp@example.com")

def test_verify_reset_otp_invalid(client: TestClient):
    # Ensure user exists
    client.post(
        "/auth/signup",
        json={"email": "invalidotp@example.com", "password": "password123"},
    )

    response = client.post(
        "/auth/verify-reset-otp",
        json={"email": "invalidotp@example.com", "otp_code": "wrongotp"},
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "OTP expired or not found"}

@patch('backend.app.utils.jwt.decode')
def test_reset_password(mock_jwt_decode, client: TestClient, db_session):
    # Ensure user exists
    client.post(
        "/auth/signup",
        json={"email": "reset@example.com", "password": "oldpassword"},
    )
    
    # Mock JWT decode to return a valid payload for the test user
    mock_jwt_decode.return_value = {"sub": "reset@example.com", "type": "password_reset", "exp": datetime.utcnow() + timedelta(minutes=5)}

    response = client.post(
        "/auth/reset-password",
        json={"reset_token": "dummy_reset_token", "new_password": "newpassword"},
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Password reset successfully", "status": "success"}
    
    # Verify password actually changed in DB
    user = db_session.query(models.User).filter(models.User.email == "reset@example.com").first()
    from backend.app.utils import verify_password
    assert verify_password("newpassword", user.hashed_password)

def test_reset_password_invalid_token(client: TestClient):
    response = client.post(
        "/auth/reset-password",
        json={"reset_token": "invalid_token", "new_password": "newpassword123"},
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid or expired reset token"}
