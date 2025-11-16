# API Design Specification - Accountability Platform

## 1. Core API Endpoints

### Public APIs (Frontend)

```
GET    /api/v1/officials                          # List all officials (with filters)
GET    /api/v1/officials/{state}/{district}       # Get official by location
GET    /api/v1/officials/{official_id}            # Get official profile
GET    /api/v1/officials/{official_id}/votes      # Voting records
GET    /api/v1/officials/{official_id}/donations  # Campaign finance
GET    /api/v1/officials/{official_id}/stocks     # Stock trades
GET    /api/v1/officials/{official_id}/promises   # Campaign promises
GET    /api/v1/search                             # Search officials by name/issue
GET    /api/v1/stats                              # Platform statistics
```

### Admin APIs

```
POST   /api/v1/admin/auth/request                 # Request magic link
POST   /api/v1/admin/auth/verify                  # Verify magic link token
POST   /api/v1/admin/auth/logout                  # Invalidate session

GET    /api/v1/admin/jobs                         # List scraping jobs
POST   /api/v1/admin/jobs/update-all              # Trigger full update
GET    /api/v1/admin/jobs/{job_id}                # Job status

GET    /api/v1/admin/summaries                    # List all AI summaries
PUT    /api/v1/admin/summaries/{summary_id}       # Edit summary
POST   /api/v1/admin/summaries/{summary_id}/regenerate  # Re-run AI

GET    /api/v1/admin/health                       # System health check
```

### Internal APIs (Not exposed externally)

```
POST   /api/internal/scrape/{official_id}         # Scrape single official
POST   /api/internal/scrape/batch                 # Scrape multiple officials
POST   /api/internal/summarize/{official_id}      # Generate AI summary
POST   /api/internal/detect-stale                 # Find outdated data
POST   /api/internal/revalidate                   # Trigger ISR
```

---

## 2. JSON Schemas

### Official Profile (`officials/{state}/{district_X or senator_X}.json`)

```json
{
  "id": "ca-12",
  "type": "representative|senator",
  "personal": {
    "name": "Nancy Pelosi",
    "party": "Democratic",
    "state": "CA",
    "district": "12",
    "photoUrl": "https://...",
    "contactInfo": {
      "phone": "202-225-4965",
      "email": "...",
      "website": "..."
    }
  },
  "reElection": {
    "nextElection": "2024-11-05",
    "termEnd": "2025-01-03",
    "previousResults": [
      {"year": 2022, "votePercent": 86.5, "opponent": "John Dennis"}
    ]
  },
  "promises": {
    "lastUpdated": "2025-11-15T10:00:00Z",
    "items": [
      {
        "id": "p1",
        "text": "Lower prescription drug costs",
        "source": "Campaign website 2022",
        "category": "healthcare",
        "aiGenerated": true
      }
    ],
    "aiSummary": "Focused on healthcare affordability and climate action..."
  },
  "metadata": {
    "createdAt": "2025-01-01T00:00:00Z",
    "lastScraped": "2025-11-15T10:00:00Z",
    "dataVersion": "1.2.3"
  }
}
```

### Voting Records (`votes/{official_id}/{year}.json`)

```json
{
  "officialId": "ca-12",
  "year": 2024,
  "lastUpdated": "2025-11-15T10:00:00Z",
  "votes": [
    {
      "id": "hr-1234",
      "billNumber": "H.R. 1234",
      "title": "Infrastructure Investment Act",
      "date": "2024-03-15",
      "vote": "yes|no|not-voting|present",
      "billSummary": "Allocates $500B for infrastructure...",
      "source": "govtrack"
    }
  ],
  "aiSummary": "Voted consistently for climate legislation, opposed defense spending increases..."
}
```

### Donations (`donations/{official_id}/{cycle}.json`)

```json
{
  "officialId": "ca-12",
  "cycle": "2024",
  "lastUpdated": "2025-11-15T10:00:00Z",
  "summary": {
    "totalRaised": 15000000,
    "individualContributions": 8000000,
    "pacContributions": 5000000,
    "selfFunding": 2000000
  },
  "topDonors": [
    {
      "name": "ActBlue",
      "amount": 2500000,
      "type": "PAC",
      "industry": "Political Organizations"
    }
  ],
  "topIndustries": [
    {"industry": "Technology", "amount": 3000000},
    {"industry": "Healthcare", "amount": 2000000}
  ],
  "aiSummary": "Funding heavily from tech and healthcare sectors...",
  "source": "opensecrets"
}
```

### Stock Trades (`stocks/{official_id}/{year}.json`)

```json
{
  "officialId": "ca-12",
  "year": 2024,
  "lastUpdated": "2025-11-15T10:00:00Z",
  "trades": [
    {
      "id": "t1",
      "date": "2024-03-15",
      "ticker": "NVDA",
      "assetName": "NVIDIA Corporation",
      "transactionType": "purchase|sale",
      "amount": "$15,001 - $50,000",
      "filingDate": "2024-03-30",
      "reportUrl": "https://..."
    }
  ],
  "aiSummary": "Active trading in technology stocks, purchased NVDA before AI legislation vote...",
  "conflictAlerts": [
    {
      "tradeId": "t1",
      "reason": "Purchased NVDA 14 days before voting on AI regulation bill",
      "severity": "medium"
    }
  ],
  "source": "fec"
}
```

### Job Status (`jobs/{job_id}.json`)

```json
{
  "id": "job-20251115-001",
  "type": "update-all|scrape-official|summarize",
  "status": "pending|running|completed|failed",
  "startedAt": "2025-11-15T10:00:00Z",
  "completedAt": "2025-11-15T10:30:00Z",
  "progress": {
    "total": 150,
    "completed": 75,
    "failed": 2
  },
  "errors": [
    {"officialId": "ny-14", "error": "API rate limit exceeded"}
  ],
  "result": {
    "officialsUpdated": 73,
    "summariesGenerated": 45,
    "isrTriggered": true
  }
}
```

---

## 3. Authentication Flow

### Magic Link Implementation

```python
# Request flow
POST /api/v1/admin/auth/request
{
  "email": "admin@example.com"
}

# Backend:
1. Validate email against allowlist (env var: ADMIN_EMAIL)
2. Generate JWT token (exp: 15 min)
3. Store token in S3: auth/tokens/{token_hash}.json
4. Send email with link: https://app.com/admin/auth?token=xxx
5. Return: {"success": true, "message": "Check your email"}

# Verify flow
POST /api/v1/admin/auth/verify
{
  "token": "jwt_token_from_email"
}

# Backend:
1. Validate JWT signature and expiration
2. Check token exists in S3 and not used
3. Mark token as used in S3
4. Generate session token (exp: 7 days)
5. Return: {"sessionToken": "xxx", "expiresAt": "..."}

# Session management
- Store active sessions in S3: auth/sessions/{session_id}.json
- Middleware checks session token on all /admin/* endpoints
- Session JSON: {"userId": "admin", "createdAt": "...", "expiresAt": "..."}
```

### Middleware

```python
from fastapi import Header, HTTPException

async def verify_admin(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Unauthorized")

    token = authorization.split(" ")[1]
    session = await s3_client.get_json(f"auth/sessions/{token}.json")

    if not session or session["expiresAt"] < now():
        raise HTTPException(401, "Session expired")

    return session
```

---

## 4. Update Workflow

### Complete Pipeline

```
┌─────────────────┐
│ Admin triggers  │
│ "Update All"    │
└────────┬────────┘
         │
         v
┌─────────────────────────────────────────────┐
│ 1. SCRAPE PHASE                             │
│ - Fetch from ProPublica/OpenSecrets/FEC    │
│ - Scrape campaign websites                  │
│ - Parallel processing (10 concurrent)       │
│ - Store raw data: raw/{official_id}/...    │
└────────┬────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────┐
│ 2. STALE DETECTION                          │
│ - Compare new data hash vs stored hash      │
│ - Store hashes: metadata/{official_id}.json│
│ - Flag changed sections (votes/donations)  │
└────────┬────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────┐
│ 3. AI SUMMARIZATION (only if changed)      │
│ - Generate summaries for changed data      │
│ - Prompt: "Summarize in neutral tone..."   │
│ - Store: summaries/{official_id}/{type}.json│
└────────┬────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────┐
│ 4. S3 STORAGE                               │
│ - Merge data into official profile          │
│ - Update officials/{state}/{district}.json │
│ - Atomic write with versioning             │
└────────┬────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────┐
│ 5. ISR REVALIDATION                         │
│ - Call Vercel revalidate API               │
│ - Paths: /officials/{id}, /officials/{state}│
│ - Track success in job metadata            │
└─────────────────────────────────────────────┘
```

### Implementation

```python
async def update_all_officials():
    job_id = f"job-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    job = Job(id=job_id, type="update-all", status="running")

    officials = await get_all_officials_list()

    for official in officials:
        try:
            # 1. Scrape
            new_data = await scrape_official(official.id)

            # 2. Detect changes
            old_hash = await get_data_hash(official.id)
            new_hash = compute_hash(new_data)

            if old_hash != new_hash:
                # 3. Summarize changed sections
                changed_sections = detect_changed_sections(old_hash, new_hash)
                for section in changed_sections:
                    summary = await ai_summarize(new_data[section])
                    new_data[section]["aiSummary"] = summary

                # 4. Save to S3
                await s3_client.put_json(
                    f"officials/{official.state}/{official.district}.json",
                    new_data
                )

                # 5. Trigger ISR
                await trigger_isr_revalidation([
                    f"/officials/{official.id}",
                    f"/officials/{official.state}"
                ])

                job.progress["completed"] += 1

        except Exception as e:
            job.errors.append({"officialId": official.id, "error": str(e)})
            job.progress["failed"] += 1

    job.status = "completed"
    await save_job(job)
```

---

## 5. S3 File Organization

### Directory Structure

```
accountability-platform-data/
├── officials/
│   ├── ca/
│   │   ├── district_12.json       # Representative
│   │   ├── district_13.json
│   │   └── senator_1.json          # Senator (numbered 1,2)
│   ├── ny/
│   │   └── ...
│   └── ga/
│       └── ...
├── votes/
│   ├── ca-12/
│   │   ├── 2024.json
│   │   └── 2023.json
│   └── ...
├── donations/
│   ├── ca-12/
│   │   ├── 2024.json
│   │   └── 2022.json
│   └── ...
├── stocks/
│   ├── ca-12/
│   │   └── 2024.json
│   └── ...
├── summaries/
│   ├── ca-12/
│   │   ├── votes.json
│   │   ├── donations.json
│   │   └── stocks.json
│   └── ...
├── metadata/
│   ├── ca-12.json                  # Data hashes, last updated times
│   └── ...
├── raw/                             # Raw scraped data (for debugging)
│   ├── ca-12/
│   │   ├── propublica_20251115.json
│   │   └── opensecrets_20251115.json
│   └── ...
├── jobs/
│   ├── job-20251115-001.json
│   └── ...
└── auth/
    ├── tokens/
    │   └── {token_hash}.json
    └── sessions/
        └── {session_id}.json
```

### Naming Conventions

- **Official IDs**: `{state}-{district}` (e.g., `ca-12`, `ny-14`, `ga-senator-1`)
- **States**: Lowercase abbreviations (`ca`, `ny`, `ga`)
- **Districts**: `district_{number}.json` or `senator_{1|2}.json`
- **Years**: Use election cycles for donations (`2024`, `2022`), calendar years for votes/stocks

---

## 6. ISR Integration

### Vercel Revalidation

```python
import httpx

async def trigger_isr_revalidation(paths: list[str]):
    """
    Trigger Next.js ISR revalidation via Vercel API
    """
    revalidate_url = f"{VERCEL_DEPLOYMENT_URL}/api/revalidate"

    async with httpx.AsyncClient() as client:
        for path in paths:
            try:
                response = await client.post(
                    revalidate_url,
                    json={"path": path},
                    headers={"Authorization": f"Bearer {REVALIDATE_SECRET}"},
                    timeout=10
                )
                response.raise_for_status()
            except Exception as e:
                # Log but don't fail the entire update
                logger.error(f"ISR revalidation failed for {path}: {e}")
```

### Next.js Revalidate API Route

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('authorization')?.replace('Bearer ', '')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { path } = await request.json()

  try {
    revalidatePath(path)
    return NextResponse.json({ revalidated: true, path })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 })
  }
}
```

### Revalidation Strategy

- **On official update**: Revalidate `/officials/{id}` and `/officials/{state}`
- **On batch update**: Revalidate home page and all affected state pages
- **Fallback**: Set `revalidate: 3600` (1 hour) in page config for background updates

---

## 7. Error Handling

### Strategy

```python
# Custom exceptions
class ScrapingError(Exception):
    """Failed to scrape data source"""
    pass

class AIError(Exception):
    """AI summarization failed"""
    pass

class S3Error(Exception):
    """S3 operation failed"""
    pass

# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled error: {exc}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if DEBUG else "An error occurred",
            "requestId": request.state.request_id
        }
    )

# Retry logic for external APIs
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
async def fetch_from_propublica(official_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{PROPUBLICA_API}/members/{official_id}")
        response.raise_for_status()
        return response.json()
```

### Error Response Format

```json
{
  "error": "NotFound",
  "message": "Official with ID 'ca-99' not found",
  "requestId": "req-123456",
  "timestamp": "2025-11-15T10:00:00Z"
}
```

### Logging

```python
import structlog

logger = structlog.get_logger()

# Log with context
logger.info(
    "official_updated",
    official_id="ca-12",
    sections_changed=["votes", "donations"],
    duration_ms=1250
)
```

### Graceful Degradation

- If AI summarization fails, store data without summary
- If ISR revalidation fails, data still updated (will serve on next request)
- If single official scrape fails in batch, continue with others
- Store partial results in job metadata

---

## Implementation Checklist

- [ ] Set up FastAPI project with async support
- [ ] Configure S3 client (boto3) with proper credentials
- [ ] Implement magic link authentication
- [ ] Create scraper modules for each data source
- [ ] Build AI summarization service (OpenAI/Anthropic)
- [ ] Implement stale data detection (hash-based)
- [ ] Set up job queue/tracking system
- [ ] Create ISR revalidation endpoint
- [ ] Add comprehensive error handling and logging
- [ ] Write API documentation (OpenAPI/Swagger)
- [ ] Set up monitoring and alerts
- [ ] Configure CORS for Next.js frontend
- [ ] Add rate limiting on public endpoints
- [ ] Implement caching layer (Redis optional)

---

## Environment Variables

```bash
# AWS
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
S3_BUCKET=accountability-platform-data

# External APIs
PROPUBLICA_API_KEY=xxx
OPENSECRETS_API_KEY=xxx
FEC_API_KEY=xxx
GOVTRACK_API_KEY=xxx

# AI
OPENAI_API_KEY=xxx  # or ANTHROPIC_API_KEY

# Auth
ADMIN_EMAIL=admin@example.com
JWT_SECRET=xxx
SESSION_SECRET=xxx

# Frontend
VERCEL_DEPLOYMENT_URL=https://accountability.vercel.app
REVALIDATE_SECRET=xxx

# Email (for magic links)
SENDGRID_API_KEY=xxx
FROM_EMAIL=noreply@accountability.com

# Misc
DEBUG=false
LOG_LEVEL=info
```

---

## Performance Considerations

1. **Caching**: Use CloudFront in front of S3 for official profiles (TTL: 1 hour)
2. **Batch Operations**: Process officials in parallel (limit: 10 concurrent)
3. **API Rate Limits**: Implement exponential backoff for external APIs
4. **ISR**: Set reasonable revalidation intervals (1 hour default)
5. **Compression**: Enable gzip for all JSON responses
6. **Monitoring**: Track scraping duration, API errors, ISR success rate

---

## Future Enhancements (Post-v1)

- WebSocket support for real-time job progress
- GraphQL API for flexible frontend queries
- PostgreSQL for relational queries (keep S3 as source of truth)
- Multi-admin support with RBAC
- Webhook notifications for data updates
- API versioning strategy
