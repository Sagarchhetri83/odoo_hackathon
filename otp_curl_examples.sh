#!/bin/bash

# Base URL for the backend API
BASE_URL="http://localhost:8000/auth"

# 1. User Signup
echo "\n--- 1. User Signup ---"
curl -X POST \
  ${BASE_URL}/signup \
  -H "Content-Type: application/json" \
  -d '{ "email": "user@example.com", "password": "password123" }'

# 2. User Login
echo "\n--- 2. User Login ---"
LOGIN_RESPONSE=$(curl -X POST \
  ${BASE_URL}/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "user@example.com", "password": "password123" }'
)
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r .access_token)
echo $LOGIN_RESPONSE

# 3. Request OTP for Password Reset
echo "\n--- 3. Request OTP for Password Reset ---"
REQUEST_OTP_RESPONSE=$(curl -X POST \
  ${BASE_URL}/request-reset-otp \
  -H "Content-Type: application/json" \
  -d '{ "email": "user@example.com" }'
)
echo $REQUEST_OTP_RESPONSE

# NOTE: In a real scenario, the OTP would be sent to the user's email.
# For testing, you would typically retrieve the OTP from Redis directly or mock the email sending.
# Assuming the OTP generated and logged by the backend is '123456' for demonstration purposes.
# Replace '123456' with the actual OTP if you are running the backend and capturing its logs.

OTP_CODE="123456"

# 4. Verify OTP
echo "\n--- 4. Verify OTP ---"
VERIFY_OTP_RESPONSE=$(curl -X POST \
  ${BASE_URL}/verify-reset-otp \
  -H "Content-Type: application/json" \
  -d '{ "email": "user@example.com", "otp_code": "'${OTP_CODE}'" }'
)
RESET_TOKEN=$(echo $VERIFY_OTP_RESPONSE | jq -r .reset_token)
echo $VERIFY_OTP_RESPONSE

# 5. Reset Password
echo "\n--- 5. Reset Password ---"
curl -X POST \
  ${BASE_URL}/reset-password \
  -H "Content-Type: application/json" \
  -d '{ "reset_token": "'${RESET_TOKEN}'", "new_password": "newsecurepassword123" }'
