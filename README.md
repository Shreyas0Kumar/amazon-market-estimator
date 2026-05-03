# NicheScope

NicheScope is a full-stack Amazon market intelligence app. The React frontend accepts an Amazon URL and access PIN, then calls a FastAPI backend that scrapes competitor products, estimates revenue, scores market opportunity, and generates AI insights.

## Project Structure

- `frontend/` - Vite React app deployed to Cloudflare Pages
- `backend/` - FastAPI API deployed to Fly.io
- `.github/workflows/` - GitHub Actions deploy workflows

## Local Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend environment variables:

```text
APP_PIN=1234
RAINFOREST_API_KEY=...
SCRAPINGDOG_API_KEY=...
OPENAI_API_KEY=...
CACHE_TTL_SECONDS=3600
REDIS_URL=redis://localhost:6379
```

`REDIS_URL` is optional. If Redis is unavailable, the backend falls back to an in-memory cache.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend environment variables:

```text
VITE_API_URL=http://localhost:8000
VITE_APP_PIN=1234
```

## Tests

Backend:

```bash
python -m pytest backend/tests/test_revenue.py
```

Frontend:

```bash
cd frontend
npx vitest run
```

## Deployment

Backend deploys to Fly.io with `.github/workflows/deploy-backend.yml`.

Required GitHub secret:

```text
FLY_API_TOKEN
```

Backend runtime secrets must be set in Fly:

```bash
fly secrets set APP_PIN=...
fly secrets set RAINFOREST_API_KEY=...
fly secrets set SCRAPINGDOG_API_KEY=...
fly secrets set OPENAI_API_KEY=...
```

Frontend deploys to Cloudflare Pages with `.github/workflows/deploy-frontend.yml`.

Required GitHub secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
VITE_API_URL
VITE_APP_PIN
```

The production frontend origin is allowed by backend CORS:

```text
https://nichescope.shreyas.space
```
