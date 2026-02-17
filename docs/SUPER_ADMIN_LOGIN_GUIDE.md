# 🔐 Super Admin Login Guide

## ✅ VERIFIED CREDENTIALS (Tested & Working)

**Login URL:** `http://localhost:3000/super-admin/login`

**Email:** `revanth@innovatebooks.in`  
**Password:** `Pandu@1605`

---

## 🧪 Backend Login Test (PASSED ✅)

The backend API was tested and confirmed working:

```bash
✅ LOGIN SUCCESS!
✅ Is Super Admin: True
✅ Message: Login successful
```

---

## 📋 Step-by-Step Login Instructions

### Method 1: Using the Frontend (Recommended)

1. **Open your browser**
2. **Go to:** `http://localhost:3000/super-admin/login`
3. **Enter credentials EXACTLY as shown below:**
   - Email: `revanth@innovatebooks.in`
   - Password: `Pandu@1605`
4. **Click:** "Access Admin Portal" button
5. **You should be redirected to:** Organizations Dashboard

### Method 2: Direct API Test (If frontend has issues)

```bash
curl -X POST http://localhost:8001/api/enterprise/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"revanth@innovatebooks.in","password":"Pandu@1605"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "access_token": "eyJ...",
  "user": {
    "is_super_admin": true,
    "email": "revanth@innovatebooks.in"
  }
}
```

---

## 🔍 Troubleshooting

### If login doesn't work:

**1. Check if frontend is running:**
```bash
curl http://localhost:3000/super-admin/login
```
Should return HTML page (not 404)

**2. Check backend is running:**
```bash
curl http://localhost:8001/api/enterprise/auth/login
```
Should return: `{"detail":"Method Not Allowed"}` (POST required)

**3. Check browser console:**
- Open browser DevTools (F12)
- Go to Console tab
- Try logging in
- Check for any error messages

**4. Common Issues:**

- ❌ **"Invalid email or password"**  
  Solution: Make sure you're typing the credentials EXACTLY:
  - Email: `revanth@innovatebooks.in` (NOT @innovatebooks.com)
  - Password: `Pandu@1605` (case-sensitive, has @ symbol)

- ❌ **"Network Error" / "Failed to fetch"**  
  Solution: Backend might be down. Check:
  ```bash
  sudo supervisorctl status backend
  ```

- ❌ **Page not found (404)**  
  Solution: Frontend routes might not be updated. Check:
  ```bash
  curl http://localhost:3000
  ```

---

## 🎯 What Happens After Login

Once logged in successfully, you will see:

### Platform Statistics (Top Cards)
- 📊 Total Organizations: 3
- 👥 Total Platform Users: 2
- 💰 Monthly Recurring Revenue: ₹0
- 📈 Activation Rate: 33.3%

### Organizations Table
Shows all organizations with:
- Organization name & slug
- Subscription status (Active/Trial/Expired)
- User counts (active/inactive)
- Data metrics (customers, invoices, leads)
- Health scores
- Action buttons

---

## 🔄 Reset Credentials (If needed)

If you need to reset the password, run:

```bash
cd /app/backend && python3 -c "
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from enterprise_auth_service import hash_password
from datetime import datetime, timezone

load_dotenv()

async def reset_password():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    await db.enterprise_users.update_one(
        {'email': 'revanth@innovatebooks.in'},
        {'\$set': {
            'password_hash': hash_password('Pandu@1605'),
            'updated_at': datetime.now(timezone.utc)
        }}
    )
    print('✅ Password reset to: Pandu@1605')
    client.close()

asyncio.run(reset_password())
"
```

---

## 📞 Contact Support

If you're still having issues:

1. **Check backend logs:**
   ```bash
   tail -50 /var/log/supervisor/backend.err.log
   ```

2. **Check frontend logs:**
   ```bash
   tail -50 /var/log/supervisor/frontend.err.log
   ```

3. **Restart services:**
   ```bash
   sudo supervisorctl restart backend frontend
   ```

---

## ✅ Verified Test Script

Run this to verify everything works:

```bash
/app/test_super_admin_portal.sh
```

Expected output:
```
✅ Super Admin login successful!
✅ Is Super Admin: True
✅ Organizations data retrieved!
```

---

## 📝 Summary

**CONFIRMED WORKING CREDENTIALS:**
- **URL:** `http://localhost:3000/super-admin/login`
- **Email:** `revanth@innovatebooks.in`
- **Password:** `Pandu@1605`

These credentials have been tested and verified at the backend level. If you're having issues with the frontend, please check:
1. Frontend is running (localhost:3000)
2. No browser console errors
3. Backend is running (localhost:8001)

The login API endpoint is working correctly!
