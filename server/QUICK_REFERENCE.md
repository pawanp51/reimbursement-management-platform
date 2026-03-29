# Quick Reference - Auth System

## 🚀 Fast Start

```bash
# 1. Setup
cp .env.example .env
# Edit .env with your DATABASE_URL and SMTP settings

# 2. Start
npm run dev  # or npm start

# 3. Test at http://localhost:5000
```

## 📍 Key Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Register new admin user |
| POST | `/api/auth/login` | No | Login any user |
| POST | `/api/auth/forgot-password` | No | Request OTP |
| POST | `/api/auth/verify-otp` | No | Verify OTP & get reset token |
| POST | `/api/auth/reset-password` | No | Reset password |
| GET | `/api/auth/me` | Yes | Get current user |

## 🧪 Quick Test

```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Pass123","firstName":"John"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Pass123"}'

# Get user (replace TOKEN)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## 🛠 Common Tasks

| Task | Command |
|------|---------|
| View database | `npm run db:studio` |
| Push schema | `npm run db:push` |
| Migrate | `npm run db:migrate` |
| Reset DB | `npm run db:reset` |
| Start dev | `npm run dev` |
| Start prod | `npm start` |

## 📊 Response Format

**Success:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {...},
  "message": "Operation successful",
  "timestamp": "2026-03-29T10:30:00.000Z"
}
```

**Error:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description"
}
```

## 🔑 Auth Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 👤 User Roles

- `EMPLOYEE` - Regular user
- `MANAGER` - Team lead
- `CTO` - Chief technical officer
- `DIRECTOR` - Director level
- `ADMIN` - Admin (all signups get this)

## 📧 Environment Variables

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@gmail.com
SMTP_PASSWORD=app_password
SMTP_FROM=noreply@app.com
```

## ⏱️ Token Expiry

- JWT Token: 7 days (configurable)
- OTP: 10 minutes
- Reset Token: 15 minutes

## 🚨 Common Errors

| Error | Solution |
|-------|----------|
| Email in use | Use different email or login |
| Invalid OTP | Check expiry (10 min) or request new |
| Token expired | Re-login to get new token |
| Email not sent | Check SMTP credentials in .env |
| DB connection error | Verify DATABASE_URL |

## 📁 File Locations

| File | Purpose |
|------|---------|
| `controllers/authControllor.js` | All auth logic |
| `routes/authRoutes.js` | Auth endpoints |
| `middleware/auth.js` | JWT & role protection |
| `utils/mailer.js` | Email sending |
| `utils/otpGenerator.js` | OTP creation |
| `prisma/schema.prisma` | Database schema |

## 🔐 Password Reset Flow

```
1. User calls /api/auth/forgot-password with email
   ↓
2. System generates 6-digit OTP
   ↓
3. OTP sent to email (check .env SMTP)
   ↓
4. User calls /api/auth/verify-otp with email + OTP
   ↓
5. System returns resetToken (15 min validity)
   ↓
6. User calls /api/auth/reset-password with resetToken + newPassword
   ↓
7. Password updated ✅
```

## 💡 Pro Tips

- All users signup as ADMIN by default
- Login works for ALL roles
- Use Prisma Studio to view live data: `npm run db:studio`
- Add more users with different roles in database manually
- Protect routes with `authMiddleware` from `middleware/auth.js`
- Use role-based middleware: `authorize('ADMIN', 'MANAGER')`

## 📚 Full Docs

- [AUTH_DOCUMENTATION.md](AUTH_DOCUMENTATION.md) - Detailed API docs
- [SETUP_SUMMARY.md](SETUP_SUMMARY.md) - Complete setup guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - Project structure
