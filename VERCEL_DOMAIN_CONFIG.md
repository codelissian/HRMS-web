# Vercel Domain Configuration Guide

## Current Setup

- **`ganesh/dev` branch** → Staging Backend: `https://hrms-backend-omega.vercel.app/api/v1`
- **`production` branch** → Production Backend: `http://35.224.247.153:9000/api/v1`

---

## Step-by-Step Domain Configuration

### Option 1: Two Separate Vercel Projects (Recommended)

This approach gives you complete separation and different domains for staging and production.

#### Project 1: Staging (ganesh/dev branch)

1. **Create Staging Project in Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **"Add New..."** → **"Project"**
   - Import repository: `codelissian/HRMS-web`
   - Project Name: `hrms-frontend-staging` (or your preferred name)

2. **Configure Git Settings:**
   - Go to **Settings** → **Git**
   - Set **Production Branch** to: `ganesh/dev`
   - Enable **"Automatically deploy from this branch"**

3. **Add Custom Domain (Staging):**
   - Go to **Settings** → **Domains**
   - Click **"Add Domain"**
   - Enter your staging domain, for example:
     - `staging.yourdomain.com` OR
     - `app-staging.yourdomain.com` OR
     - `hrms-staging.yourdomain.com`
   - Follow Vercel's DNS configuration instructions:
     - **Option A (Recommended)**: Add a CNAME record
       - Type: `CNAME`
       - Name: `staging` (or `app-staging`, `hrms-staging`)
       - Value: `cname.vercel-dns.com`
     - **Option B**: Add an A record (if you prefer)
       - Type: `A`
       - Name: `staging`
       - Value: `76.76.21.21` (Vercel's IP)

4. **Verify Domain:**
   - Vercel will automatically verify the domain
   - Once verified, SSL certificate will be automatically provisioned
   - Domain status will show as "Valid Configuration"

5. **Default Vercel Domain:**
   - You'll also get: `hrms-frontend-staging.vercel.app`
   - This works immediately without DNS configuration

#### Project 2: Production (production branch)

1. **Create Production Project in Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **"Add New..."** → **"Project"**
   - Import the **same** repository: `codelissian/HRMS-web`
   - Project Name: `hrms-frontend-production` (or your preferred name)

2. **Configure Git Settings:**
   - Go to **Settings** → **Git**
   - Set **Production Branch** to: `production`
   - Enable **"Automatically deploy from this branch"**

3. **Add Custom Domain (Production):**
   - Go to **Settings** → **Domains**
   - Click **"Add Domain"**
   - Enter your production domain, for example:
     - `app.yourdomain.com` OR
     - `hrms.yourdomain.com` OR
     - `yourdomain.com` (root domain)
   - Follow Vercel's DNS configuration instructions:
     - **For subdomain** (e.g., `app.yourdomain.com`):
       - Type: `CNAME`
       - Name: `app` (or `hrms`)
       - Value: `cname.vercel-dns.com`
     - **For root domain** (e.g., `yourdomain.com`):
       - Type: `A`
       - Name: `@` (or leave blank)
       - Value: `76.76.21.21`
       - Also add: Type `CNAME`, Name `www`, Value `cname.vercel-dns.com`

4. **Verify Domain:**
   - Vercel will automatically verify and provision SSL
   - Domain status will show as "Valid Configuration"

5. **Default Vercel Domain:**
   - You'll also get: `hrms-frontend-production.vercel.app`
   - This works immediately without DNS configuration

---

## Domain Examples

### Example 1: Subdomain Approach
```
Staging:  staging.hrms.com  → ganesh/dev branch → Staging Backend
Production: app.hrms.com    → production branch → Production Backend
```

### Example 2: Different Root Domains
```
Staging:  hrms-staging.com  → ganesh/dev branch → Staging Backend
Production: hrms.com        → production branch → Production Backend
```

### Example 3: Path-based (Not Recommended)
```
Staging:  hrms.com/staging  → ganesh/dev branch → Staging Backend
Production: hrms.com        → production branch → Production Backend
```

---

## DNS Configuration Details

### For Staging Domain (e.g., `staging.yourdomain.com`)

**In your DNS provider (GoDaddy, Namecheap, Cloudflare, etc.):**

1. Add CNAME Record:
   ```
   Type: CNAME
   Name: staging
   Value: cname.vercel-dns.com
   TTL: 3600 (or Auto)
   ```

2. Wait for DNS propagation (usually 5-60 minutes)

3. Vercel will automatically:
   - Verify domain ownership
   - Provision SSL certificate (Let's Encrypt)
   - Configure HTTPS

### For Production Domain (e.g., `app.yourdomain.com`)

**In your DNS provider:**

1. Add CNAME Record:
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   TTL: 3600 (or Auto)
   ```

2. Wait for DNS propagation

3. Vercel will automatically handle SSL

---

## Environment Variables (Optional Enhancement)

Instead of hardcoding URLs, you can use environment variables for even more flexibility:

### In Vercel Dashboard:

**For Staging Project:**
- Go to **Settings** → **Environment Variables**
- Add: `VITE_API_BASE_URL` = `https://hrms-backend-omega.vercel.app/api/v1`
- Select: Production, Preview, Development

**For Production Project:**
- Go to **Settings** → **Environment Variables**
- Add: `VITE_API_BASE_URL` = `http://35.224.247.153:9000/api/v1`
- Select: Production, Preview, Development

**Note:** Your code already supports this via `import.meta.env.VITE_API_BASE_URL` in `httpClient.ts`

---

## Deployment Workflow

### Staging Deployment:
1. Push changes to `ganesh/dev` branch
2. Vercel automatically deploys to staging project
3. Staging domain updates: `staging.yourdomain.com`
4. Connects to: Staging Backend (`https://hrms-backend-omega.vercel.app/api/v1`)

### Production Deployment:
1. Merge `ganesh/dev` → `production` (or push to `production`)
2. Vercel automatically deploys to production project
3. Production domain updates: `app.yourdomain.com`
4. Connects to: Production Backend (`http://35.224.247.153:9000/api/v1`)

---

## Verification Checklist

After configuration, verify:

- [ ] Staging project is linked to `ganesh/dev` branch
- [ ] Production project is linked to `production` branch
- [ ] Staging domain is added and verified
- [ ] Production domain is added and verified
- [ ] SSL certificates are active (automatic)
- [ ] Staging domain points to staging backend
- [ ] Production domain points to production backend
- [ ] Both domains are accessible via HTTPS

---

## Troubleshooting

### Domain Not Resolving:
1. Check DNS records are correct
2. Wait for DNS propagation (can take up to 48 hours, usually 5-60 minutes)
3. Use `dig staging.yourdomain.com` or `nslookup staging.yourdomain.com` to verify

### SSL Certificate Issues:
1. Vercel automatically provisions SSL via Let's Encrypt
2. If issues occur, check domain verification status
3. Ensure DNS is properly configured before SSL provisioning

### Wrong Backend URL:
1. Verify branch configuration in Vercel
2. Check `endpoints.ts` and `httpClient.ts` in the deployed branch
3. Consider using environment variables for easier management

---

## Quick Reference

| Branch | Vercel Project | Domain Example | Backend URL |
|--------|---------------|----------------|-------------|
| `ganesh/dev` | `hrms-frontend-staging` | `staging.yourdomain.com` | `https://hrms-backend-omega.vercel.app/api/v1` |
| `production` | `hrms-frontend-production` | `app.yourdomain.com` | `http://35.224.247.153:9000/api/v1` |

---

## Next Steps

1. **Choose your domain names** (staging and production)
2. **Create two Vercel projects** (one for each branch)
3. **Configure DNS records** in your domain provider
4. **Add domains in Vercel** and wait for verification
5. **Test deployments** by pushing to each branch
6. **Verify backend connections** are correct

---

## Support

- Vercel Docs: https://vercel.com/docs/concepts/projects/domains
- Vercel DNS Guide: https://vercel.com/docs/concepts/projects/domains/add-a-domain

