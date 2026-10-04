from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth, health, vision, recommendation, videos
from app.db.database import Base, engine, init_db_migrations

# Initialize database & run deterministic migrations
init_db_migrations()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
)

# CORS configuration for Expo development (web, emulators, devices)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["Auth"])
app.include_router(health.router, prefix=settings.API_V1_PREFIX, tags=["Health"])
app.include_router(vision.router, prefix=f"{settings.API_V1_PREFIX}/vision", tags=["Vision"])
app.include_router(vision.router, prefix=f"{settings.API_V1_PREFIX}/ingredients", tags=["Ingredients"])
app.include_router(recommendation.router, prefix=f"{settings.API_V1_PREFIX}/recommendations", tags=["Recommendations"])
app.include_router(recommendation.router, prefix=f"{settings.API_V1_PREFIX}/recipes/recommend", tags=["Recommendations"])
app.include_router(videos.router, prefix=f"{settings.API_V1_PREFIX}/videos", tags=["Videos"])

@app.get("/")
def root():
    return {
        "service": "nomz-api",
        "status": "online",
        "docs": f"{settings.API_V1_PREFIX}/docs",
        "health": f"{settings.API_V1_PREFIX}/health",
    }
