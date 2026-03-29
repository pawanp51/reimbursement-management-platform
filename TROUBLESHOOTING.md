# Troubleshooting Guide

## 🔧 Common Issues & Solutions

### Frontend Issues

#### "Cannot GET /api/..."
**Problem**: Frontend trying to call backend API but failing
**Diagnosis**:
- Is backend running? Check `http://localhost:3000`
- Is CORS enabled?
- Check error in browser console

**Solution**:
```bash
# 1. Make sure backend is running
cd server
npm run dev

# 2. Check backend is on port 3000
# Terminal should show: Server running on http://localhost:3000

# 3. If still failing, check api.js base URL
# In client/src/services/api.js:
const API_BASE_URL = 'http://localhost:3000/api';
// Should match your backend URL
```

---

#### "Cannot read property 'token' from localStorage"
**Problem**: Session not persisting, localStorage empty
**Diagnosis**:
```javascript
// In browser console:
localStorage.getItem('token')  // Should return token string
localStorage.getItem('user')   // Should return user JSON
```

**Solution**:
```javascript
// 1. Make sure you logged in successfully
// 2. Check if logout was called
localStorage.clear()  // Don't do this unless needed

// 3. After login, check token exists:
localStorage.getItem('token')

// 4. If empty after login, check response:
// DevTools → Network → login request → Response
// Should contain: { token: "...", user: {...} }
```

---

#### "Unauthorized" Message on Pages
**Problem**: Seeing 401 Unauthorized when trying to access routes
**Diagnosis**:
- Token stored but not being sent
- Token expired
- Wrong API endpoint

**Solution**:
```javascript
// 1. Check token is sent with requests
// DevTools → Network → any request
// Headers should have: Authorization: Bearer {token}

// 2. Check token format in api.js:
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,  // Must be "Bearer "
    'Content-Type': 'application/json'
  }
});

// 3. If still unauthorized, token may have expired
// Logout and login again:
localStorage.clear()
// Go to /login
```

---

#### "Role not recognized" / Redirect to /unauthorized
**Problem**: User can login but gets redirected to /unauthorized
**Diagnosis**:
```javascript
// Check your role:
// DevTools Console:
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.role);

// Should be one of: ADMIN, MANAGER, DIRECTOR, CTO, EMPLOYEE
```

**Solution**:
```javascript
// 1. Check backend user was created with correct role
// - Admin added user with EMPLOYEE role? ✓
// - User signed up (default role)? Check backend

// 2. Add yourself as admin in database:
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';

// 3. Or create admin in signup, then add users via /admin
```

---

#### "Transaction not found" / 404 on transaction page
**Problem**: Clicking transaction detail shows "Not found"
**Diagnosis**:
- Transaction ID might be wrong
- Transaction was deleted
- Transaction endpoint failing

**Solution**:
```javascript
// 1. Check transaction exists:
// Go to /employee-dashboard
// Do you see the transaction in list?

// 2. Check transaction ID in URL
// http://localhost:5174/transaction/5
// Is ID 5 in your transaction list?

// 3. If missing, refresh page:
// Browser F5 or Ctrl+R

// 4. If still not appearing, create new transaction:
// /employee-dashboard → + New Transaction
```

---

#### Blank/Empty Dashboard
**Problem**: Dashboard loads but no transactions shown
**Diagnosis**:
- No transactions exist yet
- API not returning data
- Loading state stuck

**Solution**:
```javascript
// 1. Create a transaction first:
// Go to /employee-dashboard
// Click "+ New Transaction"
// Fill form, click Create, Submit

// 2. If still empty after creating, check console:
// DevTools → Console → any errors?

// 3. Check API response:
// DevTools → Network → GET /api/transactions
// Should return array of transactions

// 4. If network shows 500 error:
// Backend has issue - check server logs
```

---

#### Form Validation Not Working
**Problem**: Can submit form without required fields
**Diagnosis**:
- Validation logic missing
- Event handler not working

**Solution**:
```javascript
// Check form component:
// E.g., CreateTransaction.jsx:

// Should have validation like:
if (!formData.description || !formData.totalAmount) {
  setError('All required fields must be filled');
  return;
}

// If not present, add it before submit
```

---

#### Styling/CSS Issues (Buttons look broken, layout wrong)
**Problem**: Styling not loading, missing Tailwind classes
**Diagnosis**:
- Tailwind CSS not compiled
- Class names misspelled
- classname library missing

**Solution**:
```bash
# 1. Restart frontend server
cd client
npm run dev

# 2. Check Tailwind is configured:
# client/tailwind.config.js should exist

# 3. Check index.css imports Tailwind:
# client/src/index.css should have:
@tailwind base;
@tailwind components;
@tailwind utilities;

# 4. Hard refresh browser:
# Ctrl + Shift + R (Windows)
# Cmd + Shift + R (Mac)
```

---

### Backend Issues

#### "Cannot connect to database"
**Problem**: Backend fails to start, "ECONNREFUSED" error
**Diagnosis**:
```bash
# Is PostgreSQL running?
# Is DATABASE_URL correct in .env?

# Check .env file:
cat .env | grep DATABASE_URL
```

**Solution**:
```bash
# 1. Check DATABASE_URL in server/.env
DATABASE_URL="postgresql://user:password@host/database"

# 2. For Neon (cloud PostgreSQL):
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/database"

# 3. Test connection:
psql your_database_url

# 4. If Neon connection, make sure:
# - No spaces in URL
# - Special characters are encoded
# - Network access enabled

# 5. If using local PostgreSQL:
# Windows:
net start PostgreSQL-x64-XX

# Mac/Linux:
brew services start postgresql
# or
sudo service postgresql start

# 6. Restart backend:
npm run dev
```

---

#### "Prisma schema mismatch"
**Problem**: "Error: The engine database schema is incompatible with the prisma schema"
**Diagnosis**:
- Database schema doesn't match schema.prisma
- Need to migrate database

**Solution**:
```bash
# 1. Run Prisma migration:
cd server
npx prisma migrate dev --name auto

# 2. If that doesn't work, reset database:
npx prisma migrate reset
# Warning: This deletes all data in database!

# 3. If still failing, check schema.prisma:
cat prisma/schema.prisma
# Verify it matches your database

# 4. After migration, restart server:
npm run dev
```

---

#### "Port 3000 already in use"
**Problem**: "Error: listen EADDRINUSE :::3000"
**Diagnosis**:
- Another process using port 3000
- Previous backend process not killed

**Solution**:
```bash
# Option 1: Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
# Note the PID (Process ID)
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>

# Option 2: Use different port
# In server.js or .env:
PORT=3001
# Then restart: npm run dev

# Option 3: Wait a moment and restart
# Sometimes takes 30 seconds to fully release port
```

---

#### "No tables found" / Schema not created
**Problem**: Prisma can't find User, Transaction tables
**Reason**: Database never migrated

**Solution**:
```bash
cd server

# 1. Create initial migration:
npx prisma migrate dev --name init

# 2. This will:
# - Create tables based on schema.prisma
# - Generate Prisma client

# 3. Verify tables created:
npx prisma studio
# Opens web interface showing database

# 4. If still no tables, reset:
npx prisma migrate reset
npx prisma migrate dev --name init
```

---

#### "Validation error" when creating user/transaction
**Problem**: "Invalid input to [model]: missing required field"
**Diagnosis**:
- Missing required field in request
- Wrong data type

**Solution**:
```javascript
// Check what backend expects:
// Look at prisma/schema.prisma

// For User model:
// Required: email, password, firstName, lastName, role

// For Transaction:
// Required: userId, description, expenseDate, category, paidBy, currency, totalAmount, status

// For TransactionApproval:
// Required: transactionId, approverId, status

// 2. Check API request includes all required fields:
POST /api/transactions
{
  "description": "Trip to NYC",  // ✓ String
  "expenseDate": "2024-03-20",   // ✓ Date
  "category": "TRAVEL",          // ✓ Enum
  "paidBy": "SELF",              // ✓ Enum
  "currency": "USD",             // ✓ String
  "totalAmount": 1500            // ✓ Number (not string)
}
// Don't include userId - backend adds from token
```

---

#### "Cannot GET /api/auth/login"
**Problem**: Login endpoint returns 404
**Reason**: Route not mounted or misspelled

**Solution**:
```javascript
// 1. Check routes/index.js:
// Should have:
app.use('/api/auth', require('./authRoutes'));
app.use('/api/transactions', require('./transactionRoutes'));
app.use('/api/approval-rules', require('./approvalRuleRoutes'));

// 2. Check server.js mounts routes:
const routes = require('./routes');
app.use(routes);

// 3. Check authRoutes.js has login endpoint:
router.post('/login', authController.login);

// 4. If still 404, restart server:
npm run dev
```

---

#### "JWT verification failed"
**Problem**: "Unauthorized - Invalid token"
**Reason**: Token invalid, expired, or malformed

**Solution**:
```javascript
// 1. Check auth middleware in server.js:
// Should verify token from Authorization header

// 2. Check token format:
// Must be: Authorization: Bearer eyJhbGc...

// 3. Token malformed?
// Logout and login again to get fresh token:
localStorage.clear()
// Go to /login
// Login again

// 4. If backend changed, tokens won't validate:
// User needs to login again
```

---

#### "Approval not working" / Transaction stays WAITING
**Problem**: After approving, transaction doesn't move to APPROVED
**Diagnosis**:
- Approver percentage not met
- Backend logic not working

**Solution**:
```javascript
// 1. Check approval rule percentage:
// If 50% threshold and 4 approvers:
// Need 2 approvals to approve

// Count approvals:
// SELECT * FROM "TransactionApproval" 
// WHERE transactionId = X AND status = 'APPROVED';

// 2. Check approver is valid:
// SELECT * FROM "TransactionApproval"
// WHERE transactionId = X AND approverId = Y;
// Should exist and have correct sequenceNumber

// 3. If CTO, check if triggering auto-approve:
// CTO should immediately approve all pending

// 4. Check backend logs:
// Terminal running backend should show:
// POST /api/transactions/{id}/approve 200 2.5ms
// or 400/500 with error message

// 5. Look for error in response:
// DevTools → Network → approve request
// Response tab should show success or error
```

---

#### "Email not sending"
**Problem**: Forgot password / User added emails not received
**Reason**: Email service not configured

**Solution**:
```bash
# 1. Check utils/mailer.js is configured:
# Should have nodemailer setup with SMTP

# 2. Check .env has EMAIL credentials:
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# 3. For Gmail:
# Need to generate "App Password" (2FA must be on)
# Use app password, not regular password

# 4. If can't setup email, you can:
# - Manually set password in database:
UPDATE "User" SET password = 'hashedPassword' WHERE id = 1;
# - Or use the API test file:
# Api-test/Auth/Forgot Password.yml

# 5. Test email:
# GET /api/auth/send-password?email=user@email.com
# Then check email inbox
```

---

### Database Issues

#### "Duplicate entry for unique field"
**Problem**: "Unique constraint failed on User.email"
**Reason**: Email already exists in database

**Solution**:
```bash
# Option 1: Use different email
# When signing up, use email not already in database

# Option 2: Check existing users:
SELECT * FROM "User" WHERE email = 'test@example.com';

# Option 3: Delete and recreate:
DELETE FROM "User" WHERE email = 'test@example.com';
# Then signup again

# Option 4: Reset database:
npx prisma migrate reset
# Deletes all data and restarts
```

---

#### "Foreign key constraint failed"
**Problem**: Error when creating transaction or approval
**Reason**: Referenced user/transaction doesn't exist

**Solution**:
```bash
# 1. Check user exists:
SELECT * FROM "User" WHERE id = 1;

# 2. Check transaction exists:
SELECT * FROM "Transaction" WHERE id = 1;

# 3. Make sure:
# - User creating transaction exists
# - Approver in rule exists
# - Transaction being approved exists

# 4. Create test data if needed:
INSERT INTO "User" (email, password, role, firstName, lastName)
VALUES ('test@example.com', 'hashed_password', 'EMPLOYEE', 'Test', 'User');
```

---

## 🧪 Testing Connectivity

### Check Backend is Running
```bash
# Terminal 1:
cd server
npm run dev
# Should show: Server running on http://localhost:3000

# Terminal 2:
curl http://localhost:3000
# Should return something (not connection refused)
```

### Check Frontend is Running
```bash
# Terminal 3:
cd client
npm run dev
# Should show: ➜  Local:   http://localhost:5174/
```

### Test API Endpoint
```bash
# In new terminal, test backend:
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Should return (if user exists):
{"token":"eyJhbGc...","user":{...}}

# If error, check backend logs in Terminal 1
```

### Test Frontend Connection
```bash
# Open browser console and run:
fetch('http://localhost:3000')
  .then(r => r.text())
  .then(console.log)
  .catch(e => console.log('Backend not running:', e.message))
```

---

## 📋 Debugging Checklist

- [ ] Both servers running in separate terminals?
- [ ] Backend on http://localhost:3000?
- [ ] Frontend on http://localhost:5174?
- [ ] PostgreSQL connection working?
- [ ] JWT token in localStorage after login?
- [ ] Authorization header sent in requests?
- [ ] CORS enabled in server.js?
- [ ] Prisma schema matches database?
- [ ] All required .env variables set?
- [ ] No syntax errors in code?
- [ ] Browser cache cleared (Ctrl+Shift+R)?
- [ ] Console shows no red errors?
- [ ] Network tab shows requests to :3000?

---

## 🎯 Quick Fixes

**"Everything broken after restart"**
```bash
# 1. Kill all node processes
# Windows: taskkill /F /IM node.exe
# Mac/Linux: killall node

# 2. Clear browser cache
# Ctrl+Shift+Delete

# 3. Restart backend
cd server && npm run dev

# 4. Restart frontend
cd client && npm run dev

# 5. Hard refresh browser
Ctrl+Shift+R

# 6. Logout and login again
```

**"Database seems corrupted"**
```bash
# Complete reset:
cd server
npx prisma migrate reset
# Answers "y" when prompted
# Recreates all tables

# Restart backend:
npm run dev
```

**"Login says wrong credentials but I'm sure password is right"**
```bash
# Option 1: Reset password
# Use forgot password feature

# Option 2: Create new account
# Sign up with different email

# Option 3: Set in database
# Need database access to hash and set password
```

---

**Still having issues? Check:**
1. Backend logs (Terminal 1)
2. Frontend console (DevTools)
3. Network requests (DevTools Network tab)
4. Database state (Prisma Studio)

---

**Last Resort**
```bash
# Full system restart:

# Terminal 1: Kill backend
Ctrl+C

# Terminal 2: Kill frontend  
Ctrl+C

# Close all developer tools

# Delete node_modules and reinstall:
cd server && rm -rf node_modules && npm install && npm run dev
# (in another terminal)
cd client && rm -rf node_modules && npm install && npm run dev

# Clear browser cache and cookies
Ctrl+Shift+Delete

# Hard refresh
Ctrl+Shift+R

# Try login again
```

---

**For Windows users use these commands:**
```bash
# Kill node process:
taskkill /F /IM node.exe

# Clear cache (PowerShell):
Remove-Item -Recurse -Force node_modules
npm install
```

