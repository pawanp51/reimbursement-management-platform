#!/bin/bash
# API Testing Guide - Save this as test_api.sh or test_api.bat

# Base URL
BASE_URL="http://localhost:5000"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Reimbursement API Tests ===${NC}\n"

# 1. Health Check
echo -e "${YELLOW}1. Health Check${NC}"
curl -X GET "$BASE_URL/health"
echo -e "\n"

# 2. Signup
echo -e "${YELLOW}2. Testing Signup${NC}"
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Password123",
    "firstName": "Test",
    "lastName": "User"
  }')
echo "$SIGNUP_RESPONSE" | jq .
TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.data.token')
echo -e "Token: ${GREEN}$TOKEN${NC}\n"

# 3. Login
echo -e "${YELLOW}3. Testing Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Password123"
  }')
echo "$LOGIN_RESPONSE" | jq .
echo -e "\n"

# 4. Get Current User (Protected)
echo -e "${YELLOW}4. Testing Get Current User${NC}"
curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
echo -e "\n"

# 5. Request Password Reset
echo -e "${YELLOW}5. Testing Forgot Password${NC}"
curl -s -X POST "$BASE_URL/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com"
  }' | jq .
echo -e "${YELLOW}Check your email for OTP${NC}\n"

# 6. Create Reimbursement (Protected)
echo -e "${YELLOW}6. Testing Create Reimbursement${NC}"
USER_ID=$(echo "$SIGNUP_RESPONSE" | jq -r '.data.user.id')
curl -s -X POST "$BASE_URL/api/reimbursements" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Office Supplies\",
    \"description\": \"Purchased office supplies for team\",
    \"amount\": 150.50,
    \"category\": \"Office\",
    \"userId\": \"$USER_ID\"
  }" | jq .
echo -e "\n"

# 7. Get All Reimbursements (Protected)
echo -e "${YELLOW}7. Testing Get All Reimbursements${NC}"
curl -s -X GET "$BASE_URL/api/reimbursements" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
echo -e "\n"

echo -e "${GREEN}=== Tests Complete ===${NC}"
