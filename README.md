# NicheScope

> Amazon Market Intelligence — estimate monthly revenue, analyze competition,
> and find entry opportunities for any Amazon niche in seconds.

**Live Demo:** https://nichescope.shreyas.space  
**Backend API:** https://nischescope-api.fly.dev/health

---

## What It Does

NicheScope turns any Amazon product or search URL into a full market analysis dashboard in seconds. Paste an Amazon URL to estimate monthly revenue, compare competing products, inspect pricing and review patterns, and get AI-generated insights with practical recommendations for entering the niche.

## Demo

<!-- Add GIF or screenshot here -->

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Recharts
- Cloudflare Pages

### Backend

- FastAPI
- Python
- Fly.io

### APIs

- Rainforest API for Amazon product and search data
- OpenAI GPT-4o-mini for market insights

### CI/CD

- GitHub Actions

## Features

- [x] Monthly revenue estimation (low/mid/high range)
- [x] Competitiveness and opportunity scoring
- [x] Top 10 products table with sortable columns
- [x] Revenue bar chart, price vs rating scatter chart
- [x] Price, rating, and review distribution charts
- [x] Brand leaderboard
- [x] AI-generated market summary and opportunity analysis
- [x] Actionable recommendations and risk flags
- [x] Dark/light mode
- [x] In-memory caching to minimize API usage
- [x] PIN-protected access

## Revenue Estimation Methodology

NicheScope uses review velocity as a directional proxy for product demand, then converts estimated units into revenue using each product's current price.

```text
Est. Monthly Units = Review Count x multiplier
```

Multipliers:

```text
Low 0.03 | Mid 0.05 | High 0.08
```

Revenue estimate:

```text
Est. Revenue = Monthly Units x Price
```

When Best Sellers Rank data is available, NicheScope applies a BSR adjustment to refine the estimate. These numbers are designed to be directional market signals, not exact sales figures.

## Running Locally

### Backend

```bash
cd backend
cp .env.example .env
# Fill in your API keys in .env
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000 in .env
npm install
npm run dev
```

## Environment Variables

Backend (`.env`):

- `RAINFOREST_API_KEY`
- `OPENAI_API_KEY`
- `APP_PIN`
- `SCRAPINGDOG_API_KEY` (fallback)
- `CACHE_TTL_SECONDS` (default 3600)

Frontend (`.env`):

- `VITE_API_URL`

## Deployment

Backend: Fly.io via Docker  
Frontend: Cloudflare Pages  
CI/CD: GitHub Actions auto-deploys on push to main

## Built By

Shreyas Kumar  
LinkedIn: https://www.linkedin.com/in/shreyas0kumar/  
GitHub: https://github.com/Shreyas0Kumar

---
