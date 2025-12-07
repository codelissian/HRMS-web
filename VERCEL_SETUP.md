# Vercel Deployment Setup Guide

## Overview
This guide explains how to configure Vercel to deploy:
- **`ganesh/dev` branch** → Staging environment (with staging backend)
- **`production` branch** → Production environment (with production backend)

---

## Option 1: Two Separate Vercel Projects (Recommended)

This approach provides complete separation between staging and production.

### Step 1: Create Staging Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Project Name**: `hrms-frontend-staging` (or your preferred name)
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (or leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Branch Configuration**:
   - Go to **Settings** → **Git**
   - Set **Production Branch** to: `ganesh/dev`
   - Enable **"Automatically deploy from this branch"**

6. **Environment Variables** (Optional - if you want to override):
   - Go to **Settings** → **Environment Variables**
   - Add: `VITE_API_BASE_URL` = `https://hrms-backend-omega.vercel.app/api/v1`
   - Select **Production**, **Preview**, and **Development** environments

### Step 2: Create Production Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import the **same** GitHub repository
4. Configure the project:
   - **Project Name**: `hrms-frontend-production` (or your preferred name)
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (or leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Branch Configuration**:
   - Go to **Settings** → **Git**
   - Set **Production Branch** to: `production`
   - Enable **"Automatically deploy from this branch"**

6. **Environment Variables** (Optional - if you want to override):
   - Go to **Settings** → **Environment Variables**
   - Add: `VITE_API_BASE_URL` = `http://35.224.247.153:9000/api/v1`
   - Select **Production**, **Preview**, and **Development** environments

### Result:
- **Staging URL**: `https://hrms-frontend-staging.vercel.app` (deploys from `ganesh/dev`)
- **Production URL**: `https://hrms-frontend-production.vercel.app` (deploys from `production`)

---

## Option 2: Single Project with Branch-Based Deployments

This approach uses one Vercel project with automatic preview deployments.

### Step 1: Create Single Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Project Name**: `hrms-frontend`
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 2: Configure Production Branch

1. Go to **Settings** → **Git**
2. Set **Production Branch** to: `production`
3. This will deploy `production` branch to your main production URL

### Step 3: Configure Preview Deployments

1. Go to **Settings** → **Git**
2. Enable **"Automatically deploy from this branch"** for `ganesh/dev`
3. Or enable **"Preview Deployments"** for all branches

### Step 4: Environment Variables (Branch-Specific)

1. Go to **Settings** → **Environment Variables**
2. Add environment variables with different values per environment:
   - **Variable**: `VITE_API_BASE_URL`
   - **Production**: `http://35.224.247.153:9000/api/v1`
   - **Preview**: `https://hrms-backend-omega.vercel.app/api/v1`
   - **Development**: `https://hrms-backend-omega.vercel.app/api/v1`

### Result:
- **Production URL**: `https://hrms-frontend.vercel.app` (deploys from `production`)
- **Preview URL**: `https://hrms-frontend-git-ganesh-dev-[team].vercel.app` (deploys from `ganesh/dev`)

---

## Option 3: Using Environment Variables (Recommended for Flexibility)

Instead of hardcoding URLs in the code, use environment variables for better flexibility.

### Update Code to Use Environment Variables

The code already supports this! Your `httpClient.ts` uses:
```typescript
baseURL: import.meta.env.VITE_API_BASE_URL || 'fallback-url'
```

### Configure in Vercel

1. **For Staging Project**:
   - Go to **Settings** → **Environment Variables**
   - Add: `VITE_API_BASE_URL` = `https://hrms-backend-omega.vercel.app/api/v1`

2. **For Production Project**:
   - Go to **Settings** → **Environment Variables**
   - Add: `VITE_API_BASE_URL` = `http://35.224.247.153:9000/api/v1`

### Benefits:
- ✅ No code changes needed when switching environments
- ✅ Easy to update URLs without redeploying
- ✅ Different URLs per environment automatically

---

## Recommended Setup

**I recommend Option 1 (Two Separate Projects)** because:
- ✅ Complete separation between staging and production
- ✅ Independent deployment pipelines
- ✅ Different domains/URLs
- ✅ Easier to manage permissions
- ✅ Can have different settings/configurations

---

## Deployment Workflow

### Staging Deployment:
1. Push changes to `ganesh/dev` branch
2. Vercel automatically deploys to staging project
3. Staging URL updates with new changes

### Production Deployment:
1. Merge `ganesh/dev` → `production` (or push directly to `production`)
2. Vercel automatically deploys to production project
3. Production URL updates with new changes

---

## Custom Domains (Optional)

You can add custom domains to each project:

1. Go to **Settings** → **Domains**
2. Add your custom domain:
   - Staging: `staging.yourdomain.com`
   - Production: `app.yourdomain.com` or `yourdomain.com`

---

## Monitoring Deployments

- View deployment status in Vercel Dashboard
- Check build logs for any errors
- Preview deployments before promoting to production
- Rollback to previous deployments if needed

---

## Notes

- Vercel automatically detects Vite projects
- The `vercel.json` file is already configured
- Environment variables prefixed with `VITE_` are exposed to the client
- Changes to environment variables require a new deployment

