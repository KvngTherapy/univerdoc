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
3. Select the `KvngTherapy/univerdoc` GitHub repository and click **Import**.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`univerdoc/frontend`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

> The repository contains the application in the nested `univerdoc/` directory. The Vercel root must be `univerdoc/frontend`, where the frontend's `package.json` is located.

### Step 3: Configure Environment Variables in Vercel
Under **Environment Variables**, add:
| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com/api` | The live URL of your deployed backend |

Add the variable for the **Production**, **Preview**, and **Development** environments as needed, then redeploy after changing it.

### Step 4: Click Deploy!
Vercel will build and assign you a free public URL (e.g. `https://univerdoc-pti.vercel.app`).

The `frontend/vercel.json` file provides the SPA fallback required for client-side routes such as `/admin`, `/student`, and `/dept/finance`.

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
   - **Root Directory**: `univerdoc/backend`
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

The recommended setup is separate frontend and backend services. If you use the Vercel CLI for the frontend, run it from the frontend directory:

```powershell
cd univerdoc/frontend
npx vercel
npx vercel --prod
```

Set `VITE_API_BASE_URL` in the Vercel project before deploying. The Express backend still needs to be deployed separately unless it is explicitly converted to Vercel serverless functions.

---

## ✅ Post-Deployment Verification Checklist
- [ ] Visit `https://your-frontend.vercel.app/`
- [ ] Test Super Admin login (`superadmin` / `Admin@123`)
- [ ] Test Department Staff login (`finance_01` / `Staff@123`)
- [ ] Test Student login (`alex.mercer` / `Alex@123`)
- [ ] Test student document upload and queue review
