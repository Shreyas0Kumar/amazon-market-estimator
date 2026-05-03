from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.analyze import router as analyze_router

app = FastAPI(title="Amazon Market Size Estimator", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://nichescope.pages.dev",
        "https://nichescope.shreyas.space",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0"}
