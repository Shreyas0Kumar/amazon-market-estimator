# NicheScope

> Amazon market intelligence — estimate monthly revenue, analyze competition, and find entry opportunities for any niche in seconds.

[![Frontend](https://img.shields.io/badge/Frontend-Cloudflare%20Pages-orange?style=flat-square&logo=cloudflare)](https://nichescope.shreyas.space)
[![Backend](https://img.shields.io/badge/Backend-Fly.io-blueviolet?style=flat-square&logo=fly.io)](https://nischescope-api.fly.dev/health)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=flat-square&logo=githubactions)](https://github.com/Shreyas0Kumar/Pixiii/actions)

**Live:** https://nichescope.shreyas.space &nbsp;|&nbsp; **API Health:** https://nischescope-api.fly.dev/health

---

## What It Does

Paste any Amazon product or search URL and NicheScope returns a full market analysis dashboard in seconds:

- Monthly revenue estimates across competing products
- Competitiveness and entry-opportunity scores
- Price vs. rating scatter analysis
- Brand market share breakdown
- AI-generated insights and entry recommendations

---

## Features

| Feature | Status |
|---|---|
| Monthly revenue estimation (low / mid / high range) | ✅ |
| Competitiveness and opportunity scoring | ✅ |
| Top 10 products table with sortable columns | ✅ |
| Revenue bar chart (custom SVG) | ✅ |
| Price vs. rating scatter plot (custom SVG) | ✅ |
| Brand leaderboard | ✅ |
| AI-generated market summary and recommendations | ✅ |
| Risk flags | ✅ |
| Analysis history (last 5 searches, persisted locally) | ✅ |
| Dark / light mode | ✅ |
| In-memory caching to minimize API usage | ✅ |
| PIN-protected access | ✅ |

---

## Tech Stack

**Frontend** — React · Vite · Custom CSS (no framework) · Cloudflare Pages

**Backend** — FastAPI · Python · Fly.io (Docker)

**APIs** — Rainforest API (Amazon data) · OpenAI GPT-4o-mini (market insights)

**CI/CD** — GitHub Actions (auto-deploy on push to `main`)

---

## Revenue Estimation Methodology

NicheScope uses review velocity as a directional proxy for demand, then converts estimated units into revenue at the product's current price.

```
Est. Monthly Units  =  Review Count × multiplier
```

| Estimate | Multiplier |
|---|---|
| Low | 0.03 |
| Mid | 0.05 |
| High | 0.08 |

```
Est. Revenue  =  Monthly Units × Price
```

When Best Sellers Rank (BSR) data is available, a BSR adjustment refines the estimate. These figures are directional market signals — not exact sales data.

---

## Running Locally

### Backend

```bash
cd backend
cp .env.example .env        # fill in your API keys
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                 # auto-connects to http://127.0.0.1:8000 on localhost
```

> The frontend detects `localhost` / `127.0.0.1` automatically and points to the local backend. No `.env` needed for local development.

---

## Environment Variables

**Backend** (`.env`)

| Variable | Description |
|---|---|
| `RAINFOREST_API_KEY` | Rainforest API key for Amazon data |
| `OPENAI_API_KEY` | OpenAI API key |
| `APP_PIN` | PIN required to access the app |
| `SCRAPINGDOG_API_KEY` | Fallback scraper API key |
| `CACHE_TTL_SECONDS` | Cache lifetime in seconds (default: `3600`) |

**Frontend** (`.env` — production only)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL override (auto-detected on localhost) |

---

## Deployment

| Layer | Platform | Trigger |
|---|---|---|
| Frontend | Cloudflare Pages | Push to `main` |
| Backend | Fly.io (Docker) | Push to `main` |

---

## Built By

**Shreyas Kumar**  
[LinkedIn](https://www.linkedin.com/in/shreyas0kumar/) · [GitHub](https://github.com/Shreyas0Kumar)
