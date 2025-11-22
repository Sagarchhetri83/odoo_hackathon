from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt

from .. import models, schemas, utils
from ..database import get_db

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

@router.post("/signup", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed_password = utils.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user or not utils.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Credentials")

    access_token_expires = timedelta(minutes=utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = utils.create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/request-reset-otp")
def request_reset_otp(otp_request: schemas.OTPRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == otp_request.email).first()
    
    # Generic success response to prevent user enumeration
    if not user:
        return {"message": "If a matching account is found, an OTP has been sent to your email.", "status": "success"}

    # Rate-limit (to be implemented more robustly with Redis in utils)
    # For now, a simple check. More advanced rate limiting will involve Redis and IP tracking.
    # Check if an OTP was recently sent to this email (e.g., within the last minute)
    # This rudimentary check helps prevent immediate resends for known emails.
    recent_otp = db.query(models.OTP).filter(
        models.OTP.user_id == user.id,
        models.OTP.created_at > (datetime.utcnow() - timedelta(minutes=1)) # Basic rate limiting
    ).first()
    if recent_otp:
        # Even if rate-limited, return a generic success message
        return {"message": "If a matching account is found, an OTP has been sent to your email.", "status": "success"}

    otp_code = utils.generate_otp()
    hashed_otp_code = utils.hash_otp(otp_code) # OTP is hashed using bcrypt as per spec

    # Store OTP in Redis with a TTL of 5 minutes (300 seconds)
    otp_key = f"otp:{user.email}"
    utils.redis_client.setex(otp_key, 300, hashed_otp_code)
    
    # For simplicity, also store in DB for now (though Redis is primary as per spec)
    # A more robust solution might rely purely on Redis for ephemeral OTPs
    new_otp_entry = models.OTP(
        otp_code=hashed_otp_code, # Storing hashed OTP in DB as well
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(minutes=5),
        is_used=False
    )
    db.add(new_otp_entry)
    db.commit()

    # In a real application, you would send this OTP via email/SMS here
    print(f"OTP for {user.email}: {otp_code}") # For development purposes

    return {"message": "If a matching account is found, an OTP has been sent to your email.", "status": "success"}

@router.post("/verify-reset-otp")
def verify_reset_otp(otp_verify: schemas.OTPVerify, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == otp_verify.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP or Email")

    # Retrieve hashed OTP from Redis
    otp_key = f"otp:{user.email}"
    stored_hashed_otp = utils.redis_client.get(otp_key)

    if not stored_hashed_otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP expired or not found")
    
    # Verify the OTP using bcrypt
    if not utils.verify_otp(otp_verify.otp_code, stored_hashed_otp):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP or Email")

    # Mark OTP as used and delete from Redis (single-use)
    utils.redis_client.delete(otp_key)

    # Generate a short-lived resetToken (JWT)
    reset_token_expires = timedelta(minutes=5) # Short-lived reset token
    reset_token = utils.create_access_token(data={"sub": user.email, "type": "password_reset"}, expires_delta=reset_token_expires)
    
    # Invalidate any stored OTP in the database (if we were storing them there for audit, etc.)
    # For now, we rely on Redis for active OTPs.

    return {"message": "OTP verified successfully", "reset_token": reset_token, "status": "success"}

@router.post("/reset-password")
def reset_password(password_reset: schemas.PasswordReset, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(password_reset.reset_token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        email = payload.get("sub")
        token_type = payload.get("type")
        if email is None or token_type != "password_reset":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired reset token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired reset token")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    hashed_password = utils.get_password_hash(password_reset.new_password)
    user.hashed_password = hashed_password
    db.commit()

    return {"message": "Password reset successfully", "status": "success"}
