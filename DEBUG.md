# 🔧 Trackmate Debug Guide

## Fixed Issues ✅

### 1. **Admin Guard & Security**
- ✅ Fixed admin guard to properly redirect non-admins to login
- ✅ Added token refresh logic to both services
- ✅ Improved logout flow with proper cleanup
- ✅ Added `setToken()` method to admin AuthService

### 2. **Error Handling**
- ✅ Enhanced error interceptor to show helpful backend connection errors
- ✅ Added status 422 validation error handling
- ✅ Added backend connectivity check message: "A szerver nem elérhető. Ellenőrizd, hogy a backend fut-e a http://localhost:8000 porton!"
- ✅ Added console logging for connection errors

### 3. **Token Management**
- ✅ Added `refreshToken()` method to BudgetService
- ✅ Added `refreshToken()` method to admin AuthService
- ✅ Fixed logout to redirect instead of reload

## 🚨 Current Issues to Check

### HTTP Error: "Http failure response for http://localhost:8000/api/register: 0 Unknown Error"

**This means:** Backend server is not running or not reachable

**Solution:**
```bash
# Terminal 1: Start the backend
cd C:\ge\trackmate\trackmate-fullstack\backend
php artisan serve --port=8000
```

### Form Inputs Not Showing Text

**Possible causes:**
1. Backend not running (redirects to login page)
2. Text color matches background (CSS issue)
3. Browser caching old styles

**Solutions:**
```bash
# Clear build cache and rebuild
ng serve --poll=2000

# Or force clean rebuild
rm -r dist/ node_modules/.cache
npm run build --force
ng serve
```

## ✅ How to Test Authentication

### 1. **Main App (calendar-calculator-app)**
- Visit: http://localhost:4200/login
- Register with: username = "testuser", password = "test123"
- Watch localStorage for: `auth_token`, `budget_user`, `is_admin`

### 2. **Admin App**
- Visit: http://localhost:4201
- Admin endpoints protected by `adminGuard`
- Only users with `is_admin=true` can access

### 3. **Token Verification**
```javascript
// In browser console
localStorage.getItem('auth_token')        // Should show token
localStorage.getItem('is_admin')          // Should show 'true' or 'false'
localStorage.getItem('budget_user')       // Should show userId
```

## 🔗 Backend Status Check

```bash
# Check if backend is running
curl http://localhost:8000/api/ping

# Expected response:
# {"status":"ok","timestamp":"2026-04-26T11:08:11.629Z"}
```

## 📋 CORS Configuration

Already configured in `config/cors.php`:
- ✅ Allowed origins: localhost:4200, localhost:4201
- ✅ Allowed methods: All
- ✅ Allowed headers: All

## 🔐 Token Refresh

Endpoints ready (if backend implements):
- `POST /api/refresh` - Refresh expired token
- Called automatically by refreshToken() methods

## 📝 Next Steps

1. **Start the backend:**
   ```bash
   cd trackmate-fullstack/backend
   php artisan serve --port=8000
   ```

2. **Check backend is running:**
   ```bash
   curl http://localhost:8000/api/ping
   ```

3. **Try registration again**
   - Form inputs should now be visible
   - Registration should work without "status 0" error

4. **Test admin functionality:**
   - Login as admin user
   - Visit admin panel at localhost:4201

