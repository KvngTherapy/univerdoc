# UniverDoc — Public Deployment Guide (Vercel & Cloud)

This guide walks you through deploying **UniverDoc** publicly to **Vercel** and connecting it with your backend and database.

---

## 🌟 Architecture Overview

```
Frontend (Vercel)  ──────>  Backend API (Render / Railway / Vercel Functions)
     ▲                                   │
     │                                   ▼
React 18 (Vite)              Managed Database (Supabase / Neon / Railway PostgreSQL)
```

---

## 🚀 Option 1: Deploying the Frontend on Vercel (Recommended)

Vercel provides the fastest, most reliable global hosting for Vite React applications.

### Step 1: Push your code to GitHub
1. Create a new repository on [github.com](https://github.com).
2. Push your `univerdoc` project to GitHub (using GitHub Desktop or Git).

### Step 2: Import into Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New..."** → **"Project"**.
3. Select your `univerdoc` GitHub repository and click **Import**.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`frontend`**
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

### Step 3: Configure Environment Variables in Vercel
Under **Environment Variables**, add:
| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com/api` | The live URL of your deployed backend |

### Step 4: Click Deploy!
Vercel will build and assign you a free public URL (e.g. `https://univerdoc-pti.vercel.app`).
*(The included `frontend/vercel.json` ensures that deep client-side routes like `/admin`, `/student`, and `/dept/finance` reload without 404 errors).*

---

## 🗄️ Setting Up Your Free Cloud Database (60 seconds)

For production, you need a hosted PostgreSQL database:
1. Go to [Supabase](https://supabase.com) or [Neon](https://neon.tech) (both provide 100% free PostgreSQL tiers).
2. Create a new project named `univerdoc`.
3. Copy your Connection String (`DATABASE_URL`), which looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres
   ```

### Initialize Database Tables:
Run this command from your terminal:
```powershell
cd backend
$env:DATABASE_URL="your-supabase-or-neon-url"
npm run prisma:postgres
node prisma/seed.js
```
*This immediately creates all tables, departments, staff slots, and the demo student in your cloud database!*

---

## ⚙️ Deploying the Backend (Render or Railway)

### On Render (render.com):
1. Create a free account on [Render](https://render.com).
2. Click **New +** → **Web Service**.
3. Connect your `univerdoc` GitHub repository.
4. Settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run prisma:generate`
   - **Start Command**: `node server.js`
5. Under **Environment Variables**, add:
   ```env
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=your-supabase-or-neon-url
   JWT_SECRET=your_long_random_jwt_secret_key_here
   SUPER_ADMIN_USERNAME=superadmin
   SUPER_ADMIN_PASSWORD=Admin@123
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
6. Click **Create Web Service**. Once deployed, copy your Render URL (e.g. `https://univerdoc-api.onrender.com`).
7. Paste this URL + `/api` into your Vercel frontend `VITE_API_BASE_URL`!

---

## ⚡ Option 2: Deploying Full-Stack Directly via Vercel CLI

If you have the Vercel CLI installed:
1. Open PowerShell in `univerdoc`:
   ```powershell
   npx vercel
   ```
2. Follow the prompts:
   - Set up and deploy: **y**
   - Which scope: *(select your account)*
   - Link to existing project: **N**
   - Project name: `univerdoc`
   - In which directory is your code located: **./**
3. Once linked, set your environment variables on Vercel and deploy to production:
   ```powershell
   npx vercel --prod
   ```

---

## ✅ Post-Deployment Verification Checklist
- [ ] Visit `https://your-frontend.vercel.app/`
- [ ] Test Super Admin login (`superadmin` / `Admin@123`)
- [ ] Test Department Staff login (`finance_01` / `Staff@123`)
- [ ] Test Student login (`alex.mercer` / `Alex@123`)
- [ ] Test student document upload and queue review