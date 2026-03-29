# Reimbursement Management Platform - Complete Frontend Integration Guide

## ✅ System Status

- **Backend Server**: Running on `http://localhost:3000`
- **Frontend Server**: Running on `http://localhost:5174`
- **Database**: PostgreSQL (Neon)

## 🎯 Architecture Overview

### Technology Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT Tokens + localStorage

### Directory Structure

```
frontend/client/src/
├── pages/
│   ├── Login.jsx                    # Login page with forgot password
│   ├── Signup.jsx                   # User registration
│   ├── EmployeeDashboard.jsx        # Employee transactions list
│   ├── Dashboard.jsx                # Manager/CTO/Director dashboard
│   ├── AdminDashboard2.jsx          # Admin management panel
│   ├── CreateTransaction.jsx        # Create/edit transactions
│   ├── TransactionDetail.jsx        # View & approve/reject transactions
│   ├── ApprovalsPage.jsx            # Queue of pending approvals
│   └── Unauthorized.jsx             # 403 access denied page
├── components/
│   ├── ProtectedRoute.jsx           # Route protection by role
│   └── Header.jsx                   # Common header with user info
├── hooks/
│   └── useAuth.js                  # Authentication state management
├── services/
│   └── api.js                      # All API endpoints configured
└── App.jsx                          # Route definitions
```

## 🔐 Authentication Flow

1. **User Login/Signup**
   - Credentials sent to `/api/auth/login` or `/api/auth/signup`
   - Backend returns: `{ token, user: { id, email, role, firstName, lastName } }`
   - Frontend stores in localStorage: `token` and `user`

2. **Protected Routes**
   - All routes use `<ProtectedRoute>` component
   - Checks `isAuthenticated` and `user.role`
   - Auto-redirects to `/login` if not authenticated
   - Auto-redirects to `/unauthorized` if role not allowed

3. **API Calls**
   - All requests automatically include `Authorization: Bearer {token}`
   - Handled by `fetchAPI` wrapper in `services/api.js`

## 📋 API Integration

### Auth API (`authAPI`)
```javascript
authAPI.signup(userData)                 // POST /api/auth/signup
authAPI.login(credentials)               // POST /api/auth/login
authAPI.forgotPassword(email)            // POST /api/auth/forgot-password
authAPI.resetPassword(token, password)   // POST /api/auth/reset-password
authAPI.addUser(userData)                // POST /api/auth/add-user (ADMIN only)
authAPI.sendPassword(email)              // POST /api/auth/send-password (ADMIN only)
```

### Transactions API (`transactionsAPI`)
```javascript
// Create & Retrieve
transactionsAPI.createTransaction(data)        // POST /api/transactions
transactionsAPI.getUserTransactions()          // GET /api/transactions
transactionsAPI.getTransactionById(id)         // GET /api/transactions/{id}
transactionsAPI.getUserTransactionHistory()    // GET /api/transactions/history/all
transactionsAPI.getPendingApprovals()          // GET /api/transactions/approvals/pending
transactionsAPI.getAllTransactions(status, userId) // GET /api/transactions/admin/all-transactions

// Manage
transactionsAPI.updateTransaction(id, data)    // PUT /api/transactions/{id}
transactionsAPI.submitTransaction(id)          // POST /api/transactions/{id}/submit
transactionsAPI.deleteTransaction(id)          // DELETE /api/transactions/{id}

// Approve/Reject
transactionsAPI.approveTransaction(id, comments)   // POST /api/transactions/{id}/approve
transactionsAPI.rejectTransaction(id, comments)    // POST /api/transactions/{id}/reject
transactionsAPI.getApprovalHistory(id)         // GET /api/transactions/{id}/approvals/history
```

### Approval Rules API (`approvalRulesAPI`)
```javascript
approvalRulesAPI.createRule(data)      // POST /api/approval-rules
approvalRulesAPI.getUserRules()        // GET /api/approval-rules
approvalRulesAPI.updateRule(id, data)  // PUT /api/approval-rules/{id}
approvalRulesAPI.deleteRule(id)        // DELETE /api/approval-rules/{id}
```

## 🛣️ Route Map

### Public Routes
- `/login` - Login page
- `/signup` - Registration page
- `/unauthorized` - 403 Access Denied

### Employee Routes (`/employee-dashboard`)
- View personal transactions
- Create new transactions
- Edit/delete DRAFT transactions
- Submit transactions for approval
- Filter by status: DRAFT, WAITING_APPROVAL, APPROVED, REJECTED

### Approver Routes (`/dashboard`)
- `/dashboard` - Main dashboard
- `/approvals` - Queue of pending approvals
- `/transaction/{id}` - View & approve/reject transaction
- Tabs: Pending Approvals, History

### Admin Routes (`/admin`)
- User management
- Create/remove users
- View platform statistics
- Approval rules management
- View all transactions

## 👥 User Roles & Permissions

### EMPLOYEE
- Can create transactions (DRAFT)
- Can edit own DRAFT transactions
- Can delete own DRAFT transactions
- Can submit own transactions for approval
- Can view own transaction history
- Cannot approve transactions

### MANAGER
- All Employee permissions
- Can approve transactions (if in approval rule)
- Can view pending approvals queue
- Can access `/dashboard`

### CTO
- All Manager permissions
- **Special**: Any approval by CTO auto-approves entire transaction
- All other pending approvals marked as APPROVED
- Useful for urgent approvals

### DIRECTOR
- Same as MANAGER
- Can approve transactions

### ADMIN
- All Employee permissions
- Manage users (create, remove)
- Create approval rules
- View platform statistics
- Access all transactions

## 🔄 Transaction Workflow

### 1. Creation (EMPLOYEE)
```
Employee creates transaction in DRAFT status
Field requirements:
- Description (text)
- Expense Date (date)
- Category (TRAVEL, MEALS, ACCOMMODATION, OFFICE, OTHER)
- Paid By (SELF, COMPANY)
- Currency (USD, EUR, etc.)
- Total Amount (number)
- Remarks (optional)
```

### 2. Submission for Approval
```
DRAFT → WAITING_APPROVAL
Creates TransactionApproval records for each approver
Approvers fetched from user's ApprovalRule
```

### 3. Sequential Approval Logic
```
If isApproversSequence = true:
  - Approver #1 must approve first
  - Approver #2 can only approve after #1
  - etc.

If isManagerApprover = true:
  - Manager must be first approver
  - Others follow after manager
```

### 4. CTO Fast Track
```
If approver.role === 'CTO':
  WAITING_APPROVAL → APPROVED (immediately)
  All pending approvals auto-marked as APPROVED
  Skip percentage calculation
```

### 5. Percentage-based Approval
```
Normal approval increments approved count
If approvedCount >= required:
  WAITING_APPROVAL → APPROVED
  
Required = ceil(total_approvers × minimalApprovalPercentage / 100)
Example: 4 approvers, 50% minimum = need 2 approvals
```

### 6. Rejection
```
Any approver can reject (requires remarks)
Transaction → REJECTED (final state)
No further approvals needed
```

## 🎨 UI Components

### Header Component
```javascript
<Header title="Page Title" />
// Shows:
// - Page title
// - Logged-in user name and role
// - Logout button
```

### ProtectedRoute Component
```javascript
<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
  <AdminPage />
</ProtectedRoute>
```

### Status Badge Component
```javascript
// Auto-colors based on status:
DRAFT → Gray
WAITING_APPROVAL → Yellow
APPROVED → Green
REJECTED → Red
```

## 📊 Data Flow Examples

### Example 1: Employee Submits Transaction

```
1. Employee fills CreateTransaction form
2. Frontend calls: transactionsAPI.createTransaction()
3. GET user's ApprovalRule from backend
4. Create TransactionApproval records for each approver
5. Set transaction.status = 'WAITING_APPROVAL'
6. Redirect to /employee-dashboard
7. Transaction appears in "WAITING_APPROVAL" filter
```

### Example 2: Manager Approves Transaction

```
1. Manager sees transaction in /approvals
2. Clicks "Review & Approve"
3. Goes to /transaction/{id}
4. Sees approval form with comment field
5. Fills comment + clicks "Approve"
6. Frontend calls: transactionsAPI.approveTransaction(id, comments)
7. Backend checks:
   - Is user an approver? ✓
   - Is previous in sequence approved? ✓
   - Is percentage threshold met? ✓
8. If all checks pass: transaction.status → 'APPROVED'
9. Frontend redirects to /dashboard
10. Transaction moves to "History" tab
```

### Example 3: CTO Auto-Approves

```
1. CTO sees transaction in /approvals
2. Clicks "Review & Approve"
3. Goes to /transaction/{id}
4. Special notice: "CTO Fast Approval - will auto-approve all"
5. Fills comment + clicks "Approve"
6. Backend detects: approver.role === 'CTO'
7. Immediately: transaction.status = 'APPROVED'
8. All other pending approvals → APPROVED
9. Response: "Transaction auto-approved by CTO"
```

## 🧪 Testing Workflow

### Test Account Setup
1. Go to `http://localhost:5174/signup`
2. Create admin account
3. Go to `/admin` dashboard
4. Add employees/managers
5. Set up approval rules

### Test Transaction Flow
1. Login as EMPLOYEE
2. Go to `/employee-dashboard`
3. Click "+ New Transaction"
4. Fill form, create transaction
5. Click "Submit"
6. Login as MANAGER/CTO
7. Go to `/dashboard`
8. Click "Pending Approvals"
9. Review & approve/reject

## 🐛 Debugging Tips

### Check Authentication State
```javascript
// In browser console:
localStorage.getItem('token')
localStorage.getItem('user')
```

### Monitor API Calls
```
Open DevTools Network tab
All requests to http://localhost:3000/api/*
Check headers: Authorization: Bearer {token}
```

### Check User Role
```javascript
// In any page:
const { user } = useAuth();
console.log('User role:', user?.role);
```

### Database Query
```sql
-- Check users
SELECT id, email, role, "firstName", "lastName" FROM "User";

-- Check transactions
SELECT id, status, "totalAmount" FROM "Transaction";

-- Check approvals
SELECT "transactionId", "approverId", status FROM "TransactionApproval";
```

## 📱 Responsive Design

- **Mobile First**: All pages mobile-optimized
- **Tailwind CSS**: Responsive utilities
- **Table Scrolling**: Tables have horizontal scroll on small screens
- **Touch Friendly**: Buttons sized for touch (min 44px)

## 🚀 Performance Optimizations

- **API Wrapper**: Single fetch implementation
- **Token Caching**: Stored in localStorage
- **Protected Routes**: Prevent unauthorized renders
- **Error Boundaries**: Graceful error handling
- **Lazy Loading**: Pages can be code-split

## 📝 Common Issues & Solutions

### Issue: "Cannot find token"
**Solution**: Make sure to login first. Token is stored after successful login.

### Issue: "Unauthorized 401"
**Solution**: Token expired. Logout and login again.

### Issue: "Forbidden 403"  
**Solution**: Your role doesn't have permission. Check user role in `/admin`.

### Issue: "Transaction not found"
**Solution**: Try refreshing the page or go back and reselect.

## 🔗 Useful Links

- Frontend: `http://localhost:5174`
- Backend: `http://localhost:3000`
- API Docs: See `Api-test/README.yml`
- Database Schema: Server: See `prisma/schema.prisma`

## ✅ Checklist - Everything Working

- [x] Authentication (Login/Signup)
- [x] Protected Routes by Role
- [x] Employee Dashboard
- [x] Transaction Creation
- [x] Transaction Submission
- [x] Approval Queue
- [x] Transaction Details View
- [x] Approval/Rejection Flow
- [x] CTO Fast Track Approval
- [x] Sequential Approval Logic
- [x] Manager/Director Dashboard
- [x] Admin Dashboard
- [x] User Management
- [x] Transaction History
- [x] Status Filtering
- [x] Responsive UI
- [x] Error Handling
- [x] API Integration

---

**Created**: March 29, 2026
**Platform**: Reimbursement Management System v1.0
