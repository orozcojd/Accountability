# Accountability Platform - Backend API

FastAPI backend for the Accountability Platform, providing data scraping, AI summarization, and API services for tracking elected officials.

## Features

- **Authentication**: Passwordless magic link authentication for admin access
- **Data Scraping**: Automated scraping from ProPublica, OpenSecrets, FEC, and campaign websites
- **AI Summarization**: Neutral summarization of voting records, campaign finance, and promises using Claude AI
- **S3 Storage**: All data stored as JSON in AWS S3 for simplicity and scalability
- **Job Management**: Background job processing for batch updates
- **ISR Integration**: Triggers Next.js Incremental Static Regeneration after data updates

## Architecture

```
External APIs → Scrapers → AI Summarization → S3 Storage → Public API → Next.js Frontend
                                                    ↓
                                             Admin Dashboard
```

## Prerequisites

- Python 3.11 or higher
- AWS account with S3 access
- API keys for:
  - ProPublica Congress API
  - OpenSecrets API
  - FEC API
  - Anthropic (Claude) or OpenAI
  - SendGrid (for email)

## Setup

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your actual credentials
```

Required environment variables:

- **AWS Credentials**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`
- **API Keys**: `PROPUBLICA_API_KEY`, `OPENSECRETS_API_KEY`, etc.
- **AI**: Either `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
- **Auth**: `JWT_SECRET`, `SESSION_SECRET`, `ADMIN_EMAIL`
- **Frontend**: `VERCEL_DEPLOYMENT_URL`, `REVALIDATE_SECRET`

### 3. Set Up S3 Bucket

Create an S3 bucket with the following structure:

```
accountability-platform-data/
├── officials/
├── votes/
├── donations/
├── stocks/
├── summaries/
├── metadata/
├── jobs/
└── auth/
```

Bucket policy example (for CloudFront access):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::accountability-platform-data/officials/*"
    }
  ]
}
```

### 4. Run the Server

Development:

```bash
uvicorn app.main:app --reload --port 8000
```

Production:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

Once running, visit:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Public Endpoints

- `GET /api/v1/officials` - List all officials (with filters)
- `GET /api/v1/officials/{official_id}` - Get official profile
- `GET /api/v1/officials/{official_id}/votes` - Get voting records
- `GET /api/v1/officials/{official_id}/donations` - Get campaign finance
- `GET /api/v1/officials/{official_id}/stocks` - Get stock trades
- `GET /api/v1/officials/{official_id}/promises` - Get promises

### Admin Endpoints (Require Authentication)

- `POST /api/v1/admin/auth/request` - Request magic link
- `POST /api/v1/admin/auth/verify` - Verify token and create session
- `POST /api/v1/admin/jobs/update-all` - Trigger full data update
- `GET /api/v1/admin/jobs` - List all jobs
- `GET /api/v1/admin/jobs/{job_id}` - Get job status
- `PUT /api/v1/admin/summaries/{summary_id}` - Edit AI summary
- `POST /api/v1/admin/summaries/{summary_id}/regenerate` - Regenerate summary

## Usage Examples

### Authentication Flow

1. Request magic link:

```bash
curl -X POST http://localhost:8000/api/v1/admin/auth/request \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com"}'
```

2. Check email for link, extract token

3. Verify token:

```bash
curl -X POST http://localhost:8000/api/v1/admin/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "your-token-here"}'
```

4. Use returned session token for authenticated requests:

```bash
curl http://localhost:8000/api/v1/admin/jobs \
  -H "Authorization: Bearer your-session-token"
```

### Trigger Data Update

```bash
curl -X POST http://localhost:8000/api/v1/admin/jobs/update-all \
  -H "Authorization: Bearer your-session-token"
```

### Get Official Data

```bash
curl http://localhost:8000/api/v1/officials/ca-12
```

## Data Scraping

The platform scrapes from multiple sources:

### ProPublica Congress API

- Basic official information
- Voting records
- Bill sponsorship
- Committee assignments

### OpenSecrets API

- Campaign contributions
- Top donors
- Industry breakdowns

### FEC API

- Financial disclosures
- Stock trades (requires PDF parsing)

### Campaign Websites

- Policy positions
- Campaign promises
- Issue stances

## AI Summarization

All summaries are generated with a strict neutrality prompt:

- No partisan language
- No judgment or opinion
- Fact-based only
- Cite sources
- Passive voice

Summaries are cached and only regenerated when data changes (hash-based detection).

## Job Management

Background jobs handle batch operations:

- **update-all**: Scrape all officials (~500 members)
- **scrape-official**: Update single official
- **summarize**: Regenerate AI summaries

Jobs are tracked in S3 with progress updates:

```json
{
  "id": "job-20251116-001",
  "type": "update-all",
  "status": "running",
  "progress": {
    "total": 535,
    "completed": 127,
    "failed": 3
  }
}
```

## Error Handling

The API includes comprehensive error handling:

- Retry logic with exponential backoff for external APIs
- Rate limit detection and handling
- Graceful degradation (partial failures don't block entire updates)
- Structured logging for debugging

## Testing

Run tests:

```bash
pytest
```

With coverage:

```bash
pytest --cov=app --cov-report=html
```

## Deployment

### AWS Lambda (Recommended for MVP)

1. Package application:

```bash
pip install -t package -r requirements.txt
cd package
zip -r ../deployment.zip .
cd ..
zip -g deployment.zip -r app
```

2. Create Lambda function with API Gateway
3. Set environment variables in Lambda configuration
4. Configure timeout (15 minutes for scraping jobs)

### Docker (Alternative)

```bash
docker build -t accountability-api .
docker run -p 8000:8000 --env-file .env accountability-api
```

### AWS ECS (For Heavy Load)

1. Build and push Docker image to ECR
2. Create ECS task definition
3. Configure Application Load Balancer
4. Set up auto-scaling

## Monitoring

Key metrics to monitor:

- API response times
- Scraping job success rates
- External API rate limits
- S3 read/write operations
- AI API costs

Use CloudWatch for logs and metrics:

```python
# Structured logging automatically integrates with CloudWatch
logger.info("official_scraped", official_id="ca-12", duration_ms=1250)
```

## Security

- Magic link tokens expire after 15 minutes
- Session tokens expire after 7 days
- All tokens stored hashed in S3
- Admin email whitelist
- CORS configured for specific origins
- No sensitive data in logs (production mode)

## Performance

Optimizations:

- Parallel scraping (10 concurrent by default)
- S3 used as cache (no database needed)
- Retry logic prevents cascading failures
- CloudFront CDN for S3 content
- ISR on frontend reduces API load

## Troubleshooting

### Common Issues

**Issue**: Magic link not received

- Check SendGrid API key
- Verify FROM_EMAIL is authorized in SendGrid
- Check spam folder
- In development, check logs for link URL

**Issue**: Scraping fails

- Verify API keys are correct
- Check rate limits (ProPublica: 5000/day)
- Review error logs in S3 jobs/

**Issue**: AI summarization errors

- Check API key validity
- Monitor token usage (costs)
- Verify model name is correct

**Issue**: ISR revalidation fails

- Ensure REVALIDATE_SECRET matches frontend
- Check Vercel deployment URL
- Verify Next.js API route exists

## Contributing

1. Follow PEP 8 style guide
2. Add type hints to all functions
3. Write tests for new features
4. Update documentation

## License

MIT License

## Support

For issues or questions, contact: support@accountability.com
