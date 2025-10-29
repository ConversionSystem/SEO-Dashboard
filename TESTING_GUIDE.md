# Testing Guide - Authentication & Redirection Fix

## Quick Test Steps

### 1. Access the Application
Open your browser and navigate to: http://localhost:3000

### 2. Test Unauthenticated Access
- You should be automatically redirected to the login page
- The URL should change to: http://localhost:3000/login

### 3. Test Login Process
Use one of these demo accounts:
- **Demo User**: demo@conversionsystem.com / demo123
- **Admin**: admin@conversionsystem.com / admin123
- **Manager**: manager@conversionsystem.com / demo123

### 4. Verify Successful Login
After clicking "Sign In":
1. You should see a success message
2. After ~0.5 seconds, you'll be redirected to the dashboard
3. The main dashboard should load with all features

### 5. Test Session Persistence
1. Refresh the page (F5)
2. You should remain logged in
3. The dashboard should load without redirecting to login

### 6. Test Protected Features
Try accessing these features (all should work):
- Keywords tab - Search for "marketing"
- SERP Analysis - Analyze "seo tools"
- Backlinks - Check "example.com"
- Advanced Tools - Try any tool

### 7. Test Logout
1. Click the logout button (red icon in header)
2. You should be redirected to the login page
3. Trying to access the dashboard should redirect to login

## Automated Testing

Run the automated test script:
```bash
cd /home/user/webapp
node test-login-flow.js
```

Expected output:
- ✅ All 6 test steps should pass
- Authentication flow should complete successfully

## Browser Console Checks

Open browser DevTools (F12) and check console:

### On Login Page:
- Should show: "No access token found, redirecting to login..."

### After Login:
- Should show: "DataForSEO Account Connected: [email]"
- Should show: "Balance: $XX.XX"
- No authentication errors

### On Dashboard:
- No 401 errors
- No redirect loops
- API calls should have Authorization headers

## Common Issues & Solutions

### Issue: Still redirecting after login
**Solution**: Clear browser localStorage and cookies, then try again
```javascript
// Run in browser console:
localStorage.clear()
location.reload()
```

### Issue: Getting 401 errors
**Solution**: Token might be expired, logout and login again

### Issue: Dashboard not loading
**Solution**: Check PM2 logs:
```bash
pm2 logs seo-dashboard --nostream
```

## What Was Fixed

1. **Server-side redirect removed**: Main page no longer redirects on server
2. **Client-side auth check**: JavaScript handles authentication
3. **Token verification**: New endpoint validates tokens
4. **Smooth redirection**: Better UX with window.location.replace()
5. **Token refresh**: Automatic token refresh on expiry

## Success Criteria

The fix is working correctly if:
- ✅ Login redirects to dashboard smoothly
- ✅ No authentication loops
- ✅ Session persists across refreshes
- ✅ Protected routes work with valid tokens
- ✅ Logout clears session properly
- ✅ Token refresh works automatically

## Need Help?

If you encounter any issues:
1. Check PM2 logs: `pm2 logs seo-dashboard`
2. Review browser console for errors
3. Run the automated test script
4. Clear browser data and retry
5. Restart the service: `pm2 restart seo-dashboard`