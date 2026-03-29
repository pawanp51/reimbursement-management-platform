# Quick Start Testing Guide

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- PostgreSQL running (Neon connection working)
- Both terminal windows ready

### 1. Start Backend Server
```bash
cd server
npm run dev
# Expected: Server running on http://localhost:3000
```

### 2. Start Frontend Server
```bash
cd client
npm run dev
# Expected: Frontend running on http://localhost:5174
```

## 📱 Test Scenarios

### Scenario 1: Complete Setup & First User
**Time: 5 minutes**

1. Visit `http://localhost:5174`
2. Click "Sign Up"
3. Create first account:
   - First Name: `Admin`
   - Last Name: `User`
   - Email: `admin@example.com`
   - Password: `Admin123!`
   - Confirm: `Admin123!`
4. You should be redirected to `/admin` dashboard
5. Navigate to "Users" tab
6. Add new user:
   - First Name: `John`
   - Last Name: `Employee`
   - Email: `john@example.com`
   - Role: `EMPLOYEE`
   - Click "Add User"
7. Note the temporary password shown

### Scenario 2: Employee Creates Transaction
**Time: 5 minutes**

1. Login as john@example.com with password shown
2. Redirected to `/employee-dashboard`
3. Click "+ New Transaction"
4. Fill form:
   - Description: "Q1 Travel Expenses"
   - Date: Pick any date within last 30 days
   - Category: `TRAVEL`
   - Paid By: `SELF`
   - Currency: `USD`
   - Amount: `1500`
   - Remarks: "Conference in NYC"
5. Click "Create Transaction"
6. Back at dashboard, see transaction in DRAFT tab

### Scenario 3: Transaction Edit & Submit
**Time: 3 minutes**

1. In employee dashboard, find DRAFT transaction
2. Click "Edit" button
3. Change amount to `2000`
4. Click "Update Transaction"
5. Now click "Submit for Approval"
6. Transaction moves to WAITING_APPROVAL
7. You're redirected back to dashboard

### Scenario 4: Manager Approval
**Time: 5 minutes**

1. **Back in Admin Dashboard**
2. Click "Users" tab
3. Add manager:
   - First Name: `Jane`
   - Last Name: `Manager`
   - Email: `jane@example.com`
   - Role: `MANAGER`
4. Note the temporary password

5. **Create Approval Rule** (Back at admin)
   - Need to run the approval rule endpoint manually or add UI:
   ```bash
   # In terminal/Postman:
   POST http://localhost:3000/api/approval-rules
   Authorization: Bearer {admin-token}
   
   Body:
   {
     "amountThreshold": 1000,
     "minimalApprovalPercentage": 50,
     "isManagerApprover": true,
     "isApproversSequence": false,
     "approvers": ["jane@example.com"]
   }
   ```

6. **Login as Manager (jane@example.com)**
   - Use password from step 4
   - Redirected to `/dashboard`
   - Click "Pending Approvals" tab
   - See John's transaction

7. **Approve Transaction**
   - Click "Review & Approve" button
   - Add comment: "Approved - Conference attendance approved"
   - Click "Approve" button
   - See success message
   - Transaction now in History tab as APPROVED

### Scenario 5: CTO Fast Approval
**Time: 5 minutes**

1. **Add CTO user**
   - In admin → Users
   - First Name: `Mike`
   - Last Name: `CTO`
   - Email: `mike@example.com`
   - Role: `CTO`

2. **Create new transaction** (as john@example.com)
   - Go to `/employee-dashboard`
   - Create transaction (same as Scenario 2)
   - Submit for approval

3. **Add CTO to approval rule**
   ```bash
   PUT http://localhost:3000/api/approval-rules/{rule-id}
   Authorization: Bearer {admin-token}
   
   Body:
   {
     "approvers": ["jane@example.com", "mike@example.com"],
     "isApproversSequence": false
   }
   ```

4. **Submit another transaction**
   - Create and submit new transaction

5. **Login as CTO** (mike@example.com)
   - Go to `/dashboard`
   - Pending Approvals tab
   - See transaction
   - Click "Review & Approve"
   - Fill comment: "Approved by CTO"
   - Click "Approve"
   - Watch: Status immediately → APPROVED

### Scenario 6: Sequential Approval
**Time: 8 minutes**

1. **Add Director user**
   - Role: `DIRECTOR`
   - Email: `bob@example.com`

2. **Create sequential rule**
   ```bash
   POST http://localhost:3000/api/approval-rules
   Authorization: Bearer {admin-token}
   
   Body:
   {
     "amountThreshold": 500,
     "minimalApprovalPercentage": 100,
     "isManagerApprover": false,
     "isApproversSequence": true,
     "approvers": ["jane@example.com", "bob@example.com", "mike@example.com"]
   }
   ```

3. **Create high-value transaction** (as john@example.com)
   - Amount: `5000`
   - Submit for approval

4. **Manager approves first** (jane@example.com)
   - Should see transaction in pending
   - Approve with comment

5. **Director approves second** (bob@example.com)
   - Should now see transaction (was hidden before jane approved)
   - Approve with comment

6. **Check status**
   - After 2/3 approvals: Still WAITING_APPROVAL
   - CTO (mike@example.com) hasn't approved yet
   - Mike approves → APPROVED (no CTO fast-track needed, 100% threshold)

### Scenario 7: Rejection
**Time: 3 minutes**

1. Create new transaction (john@example.com)
2. Submit for approval
3. Login as manager (jane@example.com)
4. Go to payment approvals
5. Click transaction
6. In approval form:
   - Add comment: "Rejected - Missing invoice"
   - Click "Reject" button
7. Transaction status → REJECTED
8. Employee sees REJECTED in dashboard
9. Can still view details but cannot edit

### Scenario 8: Admin Statistics
**Time: 2 minutes**

1. Login as admin (admin@example.com)
2. Navigate to `/admin`
3. Click "Overview" tab
4. See statistics cards:
   - Draft: Transactions in DRAFT
   - Waiting Approval: WAITING_APPROVAL
   - Approved: APPROVED
   - Rejected: REJECTED
5. Statistics update based on transactions in system

## 🧪 API Testing with Postman

### 1. Setup Postman
- Download Postman
- Create new request collection

### 2. Authentication
```
POST http://localhost:3000/api/auth/login
Headers: Content-Type: application/json
Body:
{
  "email": "admin@example.com",
  "password": "Admin123!"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "ADMIN",
    "firstName": "Admin",
    "lastName": "User"
  }
}
```

### 3. Save Token
- Copy token from response
- In Postman: Settings → Collection → Variables
- Create variable `token` = the copied token
- All requests use: `Authorization: Bearer {{token}}`

### 4. Common Endpoints to Test

**Get User's Transactions**
```
GET http://localhost:3000/api/transactions
Headers: Authorization: Bearer {{token}}
```

**Get Pending Approvals**
```
GET http://localhost:3000/api/transactions/approvals/pending
Headers: Authorization: Bearer {{token}}
```

**Approve Transaction**
```
POST http://localhost:3000/api/transactions/{id}/approve
Headers: 
  Authorization: Bearer {{token}}
  Content-Type: application/json
Body:
{
  "comments": "Looks good - approved"
}
```

**Reject Transaction**
```
POST http://localhost:3000/api/transactions/{id}/reject
Headers: 
  Authorization: Bearer {{token}}
  Content-Type: application/json
Body:
{
  "comments": "Missing invoice documentation"
}
```

## ✅ Testing Checklist

- [ ] Admin can create users
- [ ] Employee can see empty dashboard
- [ ] Employee can create transaction in DRAFT
- [ ] Employee can edit DRAFT transaction
- [ ] Employee can submit to WAITING_APPROVAL
- [ ] Manager sees transaction in pending approvals
- [ ] Manager can approve with comments
- [ ] Transaction moves to APPROVED
- [ ] Employee sees approved in history
- [ ] Manager can reject with remarks
- [ ] Transaction moves to REJECTED
- [ ] CTO auto-approval works (skips normal flow)
- [ ] Sequential approval enforces order
- [ ] Percentage-based approval working
- [ ] Admin see statistics updated
- [ ] User history shows all involved transactions
- [ ] Session persists on page refresh
- [ ] Logout clears session
- [ ] Unauthorized role redirects to /unauthorized

## 🐛 Debugging Commands

### Check Database State
```bash
# PostgreSQL command line
\dt  # List all tables
SELECT * FROM "User";
SELECT * FROM "Transaction";
SELECT * FROM "TransactionApproval";
```

### View Backend Logs
```bash
# Terminal running backend
# Should show on every request
# GET /api/transactions 200
# POST /api/transactions/{id}/approve 200
```

### Check Frontend Console
```javascript
// Browser → DevTools → Console

// Check auth state
localStorage.getItem('user')
localStorage.getItem('token')

// Check current user
// In any page component:
const { user } = useAuth();
console.log(user);

// Check API calls
// DevTools → Network tab
// All requests should have Authorization header
```

## 📊 Performance Notes

- First load: ~2 seconds (includes user fetch)
- Subsequent loads: <200ms
- Approval action: ~500ms
- Dashboard refresh: ~300ms

## 🎓 Learning Points

1. **Custom Hooks**: useAuth simplifies state management
2. **Protected Routes**: Role-based access control
3. **API Service Layer**: Centralized endpoint management
4. **Sequential Approval**: Complex business logic
5. **CTO Fast-Track**: Special case handling
6. **Transaction Status Flow**: DRAFT → WAITING → APPROVED/REJECTED

---

**Start testing now!** 🚀
