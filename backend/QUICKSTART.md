# Quick Start Guide - Accountability Platform Backend

This guide will get you up and running with the backend API in under 10 minutes.

## Prerequisites

- Python 3.11+
- AWS account with S3 bucket
- API keys (see below)

## 1. Clone and Setup (2 minutes)

```bash
cd /home/user/Accountability/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## 2. Configure Environment (3 minutes)

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

**Minimum required variables:**

```bash
# AWS
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET=accountability-platform-data

# APIs (get free keys)
PROPUBLICA_API_KEY=your-key  # https://www.propublica.org/datastore/api/propublica-congress-api
OPENSECRETS_API_KEY=your-key  # https://www.opensecrets.org/open-data/api
FEC_API_KEY=your-key  # https://api.open.fec.gov/developers/

# AI (choose one)
ANTHROPIC_API_KEY=your-key  # https://console.anthropic.com/
# OR
OPENAI_API_KEY=your-key  # https://platform.openai.com/

# Auth
ADMIN_EMAIL=your-email@example.com
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

# Frontend
VERCEL_DEPLOYMENT_URL=http://localhost:3000
REVALIDATE_SECRET=$(openssl rand -hex 32)
```

## 3. Create S3 Bucket (2 minutes)

```bash
# Using AWS CLI
aws s3 mb s3://accountability-platform-data
aws s3api put-bucket-cors --bucket accountability-platform-data --cors-configuration file://cors.json
```

**cors.json:**
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET"],
      "AllowedHeaders": ["*"]
    }
  ]
}
```

## 4. Run the Server (1 minute)

```bash
# Development mode
uvicorn app.main:app --reload

# Or run directly
python -m app.main
```

The API will be available at: http://localhost:8000

## 5. Test It Out (2 minutes)

### View API Documentation

Open your browser to:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Health Check

```bash
curl http://localhost:8000/health
```

### Request Admin Magic Link

```bash
curl -X POST http://localhost:8000/api/v1/admin/auth/request \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

### Check Your Email (or logs in dev mode)

If SendGrid is not configured, the magic link will appear in the console logs.

### Verify Token

```bash
curl -X POST http://localhost:8000/api/v1/admin/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_TOKEN_FROM_EMAIL"}'
```

Save the returned `sessionToken` for authenticated requests.

### Trigger Data Update

```bash
curl -X POST http://localhost:8000/api/v1/admin/jobs/update-all \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

### Monitor Job Progress

```bash
curl http://localhost:8000/api/v1/admin/jobs/JOB_ID \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Docker Alternative

If you prefer Docker:

```bash
# Build
docker build -t accountability-api .

# Run
docker run -p 8000:8000 --env-file .env accountability-api
```

## Next Steps

1. **Populate Initial Data**: Run `/admin/jobs/update-all` to scrape all officials
2. **Configure Frontend**: Update `VERCEL_DEPLOYMENT_URL` when frontend is deployed
3. **Set up Email**: Add SendGrid API key for magic link emails
4. **Enable Monitoring**: Configure CloudWatch or your preferred monitoring tool

## Common Issues

### Issue: "AWS credentials not found"

**Solution**: Ensure AWS credentials are in `.env` or use `aws configure`

### Issue: "Magic link not received"

**Solution**:
- Check if `SENDGRID_API_KEY` is set
- In dev mode, check console logs for the link
- Verify `ADMIN_EMAIL` matches the email you're using

### Issue: "AI summarization fails"

**Solution**:
- Verify `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` is valid
- Check API quota limits
- Review logs for specific error messages

### Issue: "Scraping fails"

**Solution**:
- Verify all API keys are valid and active
- Check rate limits (ProPublica: 5000/day)
- Review job errors: `GET /api/v1/admin/jobs/{job_id}`

## Development Tips

### Enable Debug Mode

```bash
DEBUG=true
LOG_LEVEL=debug
```

### Run Tests

```bash
pytest
pytest --cov=app --cov-report=html
```

### View Logs

Logs are structured JSON (production) or colorized console (development):

```bash
# View real-time logs
uvicorn app.main:app --reload --log-level debug
```

### Interactive API Testing

Use the built-in Swagger UI at http://localhost:8000/docs for interactive testing.

## Production Deployment

See [README.md](README.md) for full deployment instructions covering:
- AWS Lambda deployment
- Docker/ECS deployment
- Environment variables
- Monitoring setup

## Support

- Documentation: [README.md](README.md)
- Issues: Create an issue in the repository
- Email: support@accountability.com

## API Key Resources

- **ProPublica Congress API**: https://www.propublica.org/datastore/api/propublica-congress-api
  - Free tier: 5000 requests/day
  - Documentation: https://projects.propublica.org/api-docs/congress-api/

- **OpenSecrets API**: https://www.opensecrets.org/open-data/api
  - Free tier: 200 requests/day
  - Documentation: https://www.opensecrets.org/open-data/api-documentation

- **FEC API**: https://api.open.fec.gov/developers/
  - Free, requires registration
  - Documentation: https://api.open.fec.gov/developers/

- **Anthropic Claude**: https://console.anthropic.com/
  - Pay-as-you-go
  - Model: claude-3-5-sonnet-20241022

- **OpenAI**: https://platform.openai.com/
  - Pay-as-you-go
  - Model: gpt-4 or gpt-3.5-turbo

---

**You're all set!** The backend is now running and ready to serve data to your frontend.
