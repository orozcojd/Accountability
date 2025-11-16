# Accountability Platform - User Guide

**Quick, practical guide to running and managing your political accountability platform.**

---

## Table of Contents

1. [Quick Start](#quick-start) - Get running in 10 minutes
2. [Admin Dashboard](#admin-dashboard) - Manage data and summaries
3. [Production Deployment](#production-deployment) - Go live
4. [System Architecture](#system-architecture) - How it works
5. [Troubleshooting](#troubleshooting) - Fix common issues
6. [Maintenance](#maintenance) - Keep it running

---

## Quick Start

### Prerequisites

Install these before starting:

- **Node.js 18.17+** - [Download](https://nodejs.org/)
- **Python 3.11+** - [Download](https://www.python.org/)
- **AWS Account** - [Sign up](https://aws.amazon.com/)
- **API Keys** (free tiers available):
  - [ProPublica Congress API](https://www.propublica.org/datastore/api/propublica-congress-api) - 5000/day free
  - [OpenSecrets API](https://www.opensecrets.org/open-data/api) - 200/day free
  - [FEC API](https://api.open.fec.gov/developers/) - Free, requires registration
  - [Anthropic Claude](https://console.anthropic.com/) or [OpenAI](https://platform.openai.com/) - Pay-as-you-go

### 1. Clone Repository

```bash
cd /home/user/Accountability
```

### 2. Set Up Backend (5 minutes)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
# Required: AWS
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=accountability-platform-data

# Required: External APIs
PROPUBLICA_API_KEY=your-key
OPENSECRETS_API_KEY=your-key
FEC_API_KEY=your-key

# Required: AI (choose one)
ANTHROPIC_API_KEY=your-key
# OR
OPENAI_API_KEY=your-key

# Required: Auth
ADMIN_EMAIL=your-email@example.com
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
REVALIDATE_SECRET=$(openssl rand -hex 32)

# Required: Frontend
VERCEL_DEPLOYMENT_URL=http://localhost:3000
```

Create S3 bucket:

```bash
aws s3 mb s3://accountability-platform-data

# Set CORS for frontend access
aws s3api put-bucket-cors --bucket accountability-platform-data --cors-configuration '{
  "CORSRules": [{
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"]
  }]
}'
```

Start backend:

```bash
uvicorn app.main:app --reload
```

Backend running at: http://localhost:8000

### 3. Set Up Frontend (3 minutes)

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
```

Edit `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_S3_CDN=https://d123456.cloudfront.net  # Add after CloudFront setup
REVALIDATE_SECRET=same-as-backend-secret
```

Start frontend:

```bash
npm run dev
```

Frontend running at: http://localhost:3000

### 4. Verify Installation

Open browser and test:

- **API Docs**: http://localhost:8000/docs
- **Frontend**: http://localhost:3000
- **Health Check**: `curl http://localhost:8000/health`

---

## Admin Dashboard

### Access Admin Panel

1. Navigate to: http://localhost:3000/admin
2. Request magic link:

```bash
curl -X POST http://localhost:8000/api/v1/admin/auth/request \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

3. Check email for magic link (or console logs in dev mode)
4. Click link to authenticate
5. Save session token for API calls

### Trigger Data Updates

**Update all officials** (takes 30-60 minutes for ~500+ members):

```bash
curl -X POST http://localhost:8000/api/v1/admin/jobs/update-all \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Update single official**:

```bash
curl -X POST http://localhost:8000/api/v1/admin/jobs/update-official \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"official_id": "ca-12"}'
```

### Monitor Jobs

**List all jobs**:

```bash
curl http://localhost:8000/api/v1/admin/jobs \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Check job status**:

```bash
curl http://localhost:8000/api/v1/admin/jobs/{job_id} \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

Response shows progress:

```json
{
  "id": "job-20251116-001",
  "status": "running",
  "progress": {
    "total": 535,
    "completed": 127,
    "failed": 3
  }
}
```

### Edit AI Summaries

**View summary**:

```bash
curl http://localhost:8000/api/v1/admin/summaries/{official_id}/votes \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Edit summary**:

```bash
curl -X PUT http://localhost:8000/api/v1/admin/summaries/{summary_id} \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated neutral summary..."}'
```

**Regenerate with AI**:

```bash
curl -X POST http://localhost:8000/api/v1/admin/summaries/{summary_id}/regenerate \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

### Review Scraping Results

Check for errors in job details:

```json
{
  "errors": [
    {"officialId": "ny-14", "error": "API rate limit exceeded"},
    {"officialId": "ca-99", "error": "Official not found"}
  ]
}
```

Retry failed officials individually after fixing issues.

---

## Production Deployment

### Frontend Deployment (Vercel)

**Option A: Automatic (Recommended)**

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and import repository
3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL` = Your backend URL
   - `NEXT_PUBLIC_S3_CDN` = CloudFront URL
   - `REVALIDATE_SECRET` = Same as backend
4. Deploy automatically on push to main branch

**Option B: Manual**

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_S3_CDN production
vercel env add REVALIDATE_SECRET production
```

### Backend Deployment

**Option A: AWS Lambda (Recommended for MVP)**

1. Install deployment tools:

```bash
pip install awscli aws-sam-cli
```

2. Package application:

```bash
cd backend

# Create deployment package
pip install -t package -r requirements.txt
cd package
zip -r ../deployment.zip .
cd ..
zip -g deployment.zip -r app
```

3. Create Lambda function:

```bash
aws lambda create-function \
  --function-name accountability-api \
  --runtime python3.11 \
  --handler app.main.handler \
  --zip-file fileb://deployment.zip \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
  --timeout 900 \
  --memory-size 512
```

4. Set environment variables:

```bash
aws lambda update-function-configuration \
  --function-name accountability-api \
  --environment Variables="{
    AWS_ACCESS_KEY_ID=xxx,
    PROPUBLICA_API_KEY=xxx,
    ...
  }"
```

5. Create API Gateway:
   - Go to AWS Console → API Gateway
   - Create HTTP API
   - Add Lambda integration
   - Deploy to stage

**Option B: Docker on AWS ECS**

```bash
cd backend

# Build image
docker build -t accountability-api .

# Tag for ECR
docker tag accountability-api:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/accountability-api:latest

# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/accountability-api:latest

# Create ECS service (use AWS Console or CLI)
```

**Option C: Simple VM (DigitalOcean, EC2)**

```bash
# On your server
git clone your-repo
cd backend
pip install -r requirements.txt

# Install supervisor for process management
sudo apt-get install supervisor

# Create supervisor config: /etc/supervisor/conf.d/accountability.conf
[program:accountability-api]
command=/path/to/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
directory=/path/to/backend
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/accountability-api.err.log
stdout_logfile=/var/log/accountability-api.out.log

# Start service
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start accountability-api
```

### CloudFront CDN Setup

1. Go to AWS Console → CloudFront
2. Create distribution:
   - Origin: Your S3 bucket
   - Origin Path: `/officials`
   - Viewer Protocol: HTTPS only
   - Cache Policy: CachingOptimized
   - TTL: 3600 seconds (1 hour)
3. Copy distribution URL (e.g., `d123456.cloudfront.net`)
4. Update frontend `.env`:

```bash
NEXT_PUBLIC_S3_CDN=https://d123456.cloudfront.net
```

### Post-Deployment Checklist

- [ ] Update backend `VERCEL_DEPLOYMENT_URL` to production URL
- [ ] Update frontend `NEXT_PUBLIC_API_URL` to production backend
- [ ] Configure SendGrid for magic link emails
- [ ] Set up monitoring (CloudWatch, Sentry)
- [ ] Run initial data scrape: `POST /api/v1/admin/jobs/update-all`
- [ ] Test authentication flow
- [ ] Verify ISR revalidation works
- [ ] Check CloudFront cache behavior
- [ ] Set up scheduled scraping (CloudWatch Events → Lambda)

---

## System Architecture

### High-Level Overview

```
┌─────────────────┐
│  Public Users   │
└────────┬────────┘
         │
         v
┌─────────────────────────────────┐
│   Next.js Frontend (Vercel)     │
│   - Search interface            │
│   - Official profiles           │
│   - ISR (1 hour revalidation)   │
└────────┬────────────────────────┘
         │
         ├─────────────────┬──────────────────┐
         │                 │                  │
         v                 v                  v
┌────────────┐    ┌──────────────┐   ┌──────────────┐
│ FastAPI    │    │ S3 Bucket    │   │  CloudFront  │
│ Backend    │───→│ (JSON files) │──→│     CDN      │
│ (AWS)      │    │              │   │              │
└────────────┘    └──────────────┘   └──────────────┘
         │
         v
┌──────────────────────────────────┐
│   External Data Sources          │
│   - ProPublica (Congress data)   │
│   - OpenSecrets (Finance)        │
│   - FEC (Stock trades)           │
│   - Campaign websites             │
└──────────────────────────────────┘
```

### Data Flow

**1. Scraping Phase** (Admin triggers)

```
Admin → POST /admin/jobs/update-all → Scrapers → External APIs
```

**2. AI Summarization** (Automatic for changed data)

```
Raw data → Hash comparison → Changed sections → Claude/GPT → Neutral summary
```

**3. Storage** (S3 as source of truth)

```
Summarized data → S3 JSON files → officials/{state}/{district}.json
```

**4. Frontend Update** (ISR revalidation)

```
Backend → POST /api/revalidate → Next.js → Rebuild affected pages
```

**5. User Access** (Fast CDN delivery)

```
User → Next.js → CloudFront → S3 JSON → Rendered page (cached 1 hour)
```

### S3 Directory Structure

```
accountability-platform-data/
├── officials/
│   ├── ca/district_12.json       # Nancy Pelosi
│   ├── ny/district_14.json       # AOC
│   └── ga/senator_1.json         # Senators numbered 1, 2
├── votes/{official_id}/{year}.json
├── donations/{official_id}/{cycle}.json
├── stocks/{official_id}/{year}.json
├── summaries/{official_id}/{type}.json
├── jobs/{job_id}.json
└── auth/sessions/{token}.json
```

### What's Automated vs Manual

**Automated:**
- ISR revalidation after data updates
- Retry logic for failed API calls
- Hash-based change detection
- AI summarization for changed data only
- Session token expiry

**Manual (Admin-triggered):**
- Data scraping (`POST /admin/jobs/update-all`)
- Editing AI summaries if needed
- Regenerating specific summaries
- Approving/reviewing content before initial publish

---

## Troubleshooting

### Backend Issues

**Problem: "AWS credentials not found"**

```bash
# Solution: Set in .env or configure AWS CLI
aws configure

# Or add to .env:
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

**Problem: "Magic link not received"**

```bash
# Solutions:
1. Check console logs (dev mode shows link)
2. Verify SENDGRID_API_KEY is set
3. Ensure ADMIN_EMAIL matches request email
4. Check spam folder
```

**Problem: "Scraping fails with rate limit"**

```bash
# Solutions:
1. Check API quotas (ProPublica: 5000/day)
2. Reduce MAX_CONCURRENT_SCRAPES in .env
3. Wait and retry (exponential backoff built-in)
4. Review job errors: GET /admin/jobs/{job_id}
```

**Problem: "AI summarization errors"**

```bash
# Solutions:
1. Verify API key: ANTHROPIC_API_KEY or OPENAI_API_KEY
2. Check model name: claude-3-5-sonnet-20241022
3. Monitor usage/billing in provider console
4. Review logs: LOG_LEVEL=debug in .env
```

**Problem: "ISR revalidation fails"**

```bash
# Solutions:
1. Ensure REVALIDATE_SECRET matches frontend
2. Check VERCEL_DEPLOYMENT_URL is correct
3. Verify frontend has /api/revalidate route
4. Test manually:
curl -X POST https://your-site.com/api/revalidate \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{"path": "/officials/ca-12"}'
```

### Frontend Issues

**Problem: "API connection failed"**

```bash
# Solutions:
1. Check NEXT_PUBLIC_API_URL in .env.local
2. Verify backend is running
3. Check CORS settings in backend
4. Test API directly: curl http://localhost:8000/health
```

**Problem: "Data not updating"**

```bash
# Solutions:
1. Check ISR revalidation logs
2. Manually revalidate: POST /api/revalidate
3. Clear .next cache: rm -rf .next && npm run dev
4. Verify S3 data was updated
```

**Problem: "CloudFront serving stale data"**

```bash
# Solutions:
1. Check TTL settings (should be 3600s)
2. Create invalidation:
aws cloudfront create-invalidation \
  --distribution-id YOUR_ID \
  --paths "/*"
3. Wait up to 15 minutes for propagation
```

### Logs and Debugging

**Backend logs:**

```bash
# Development
uvicorn app.main:app --reload --log-level debug

# Production (CloudWatch)
aws logs tail /aws/lambda/accountability-api --follow
```

**Frontend logs:**

```bash
# Development
npm run dev

# Production (Vercel)
vercel logs
```

**S3 job status:**

```bash
aws s3 cp s3://accountability-platform-data/jobs/{job_id}.json - | jq
```

---

## Maintenance

### Regular Updates

**How often to update data:**

- **Congress votes**: Daily during sessions, weekly during recess
- **Campaign finance**: Weekly during election years, monthly off-cycle
- **Stock trades**: Weekly (45-day filing requirement)
- **Official info**: Monthly (term changes, retirements)

**Automated schedule** (recommended):

```bash
# Set up CloudWatch Events to trigger Lambda
aws events put-rule \
  --name accountability-daily-update \
  --schedule-expression "cron(0 2 * * ? *)"  # 2 AM UTC daily

aws events put-targets \
  --rule accountability-daily-update \
  --targets "Id"="1","Arn"="arn:aws:lambda:region:account:function:accountability-api"
```

**Manual trigger:**

```bash
curl -X POST https://api.your-domain.com/api/v1/admin/jobs/update-all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Monitoring Checklist

**Daily:**
- [ ] Check scraping job success rate
- [ ] Review error logs for failed officials
- [ ] Monitor API quota usage

**Weekly:**
- [ ] Verify AI summarization quality
- [ ] Check CloudFront cache hit rate
- [ ] Review S3 storage costs
- [ ] Test authentication flow

**Monthly:**
- [ ] Update dependencies: `npm update`, `pip update`
- [ ] Review and rotate secrets
- [ ] Check for API changes in external sources
- [ ] Audit AI summaries for neutrality

### Cost Expectations

**Estimated monthly costs (based on 500+ officials, daily updates):**

| Service | Usage | Cost |
|---------|-------|------|
| **AWS S3** | 10 GB storage, 1M reads | $1-2 |
| **CloudFront** | 10 GB transfer | $1-2 |
| **Lambda** | 100K invocations, 512 MB | $5-10 |
| **Vercel** | Hobby plan | $0 (or $20 Pro) |
| **AI (Claude)** | ~500 summaries/month | $10-30 |
| **SendGrid** | 100 emails/month | $0 (free tier) |
| **External APIs** | Free tiers | $0 |
| **Total** | | **$17-64/month** |

**Cost optimization tips:**
- Use Claude 3.5 Haiku for summaries (cheaper than Sonnet)
- Enable S3 versioning with lifecycle rules (delete old versions after 30 days)
- Use CloudFront caching effectively (reduce S3 reads)
- Monitor and optimize Lambda timeout/memory
- Batch updates instead of individual scrapes

### Backup and Recovery

**S3 versioning** (enable for safety):

```bash
aws s3api put-bucket-versioning \
  --bucket accountability-platform-data \
  --versioning-configuration Status=Enabled
```

**Backup strategy:**

```bash
# Automated daily backup to separate bucket
aws s3 sync s3://accountability-platform-data s3://accountability-backups/$(date +%Y%m%d)
```

**Restore from backup:**

```bash
aws s3 sync s3://accountability-backups/20251115 s3://accountability-platform-data
```

### Updating the Application

**Frontend updates:**

```bash
cd frontend
git pull
npm install  # Install new dependencies
npm run build
vercel --prod  # Deploy
```

**Backend updates:**

```bash
cd backend
git pull
pip install -r requirements.txt

# Lambda: Repackage and update
zip -r deployment.zip .
aws lambda update-function-code \
  --function-name accountability-api \
  --zip-file fileb://deployment.zip

# Or Docker: Rebuild and push
docker build -t accountability-api .
docker push YOUR_ECR_URL
```

### Security Best Practices

- [ ] Rotate JWT_SECRET and SESSION_SECRET quarterly
- [ ] Use IAM roles instead of access keys (Lambda/ECS)
- [ ] Enable S3 bucket encryption at rest
- [ ] Use HTTPS only (no HTTP)
- [ ] Keep dependencies updated (run `npm audit`, `pip check`)
- [ ] Monitor CloudWatch for unusual activity
- [ ] Limit CORS origins to your domain only
- [ ] Use Vercel environment variables (never commit secrets)

---

## Quick Reference

### Essential Commands

```bash
# Backend
uvicorn app.main:app --reload              # Start dev server
pytest                                      # Run tests
aws s3 ls s3://accountability-platform-data # List S3 files

# Frontend
npm run dev                                 # Start dev server
npm run build                               # Build for production
vercel --prod                               # Deploy to production

# Admin API
curl -X POST .../admin/auth/request         # Request magic link
curl -X POST .../admin/jobs/update-all      # Trigger data update
curl .../admin/jobs/{job_id}                # Check job status

# Deployment
docker build -t accountability-api .        # Build Docker image
aws lambda update-function-code ...         # Update Lambda
aws cloudfront create-invalidation ...      # Clear CDN cache
```

### Important URLs

- **Local Frontend**: http://localhost:3000
- **Local Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Admin Panel**: http://localhost:3000/admin

### Key Files

- **Backend Config**: `/home/user/Accountability/backend/.env`
- **Frontend Config**: `/home/user/Accountability/frontend/.env.local`
- **Backend README**: `/home/user/Accountability/backend/README.md`
- **Frontend README**: `/home/user/Accountability/frontend/README.md`

---

## Need Help?

1. **Check the logs** - Most issues show up in console/CloudWatch logs
2. **Review API docs** - http://localhost:8000/docs has interactive testing
3. **Verify environment** - Double-check all required variables are set
4. **Test components** - Isolate frontend vs backend vs S3 vs external APIs
5. **Check quotas** - External APIs have daily limits

**Additional Resources:**
- API Design: `/home/user/Accountability/API_DESIGN_SPECIFICATION.md`
- UI/UX Design: `/home/user/Accountability/UI_UX_DESIGN_SPECIFICATION.md`
- Implementation Plan: `/home/user/Accountability/IMPLEMENTATION_PLAN.md`
- Backend Details: `/home/user/Accountability/backend/README.md`
- Frontend Details: `/home/user/Accountability/frontend/README.md`

---

**Built with Next.js 14, FastAPI, AWS S3, and Claude AI.**
