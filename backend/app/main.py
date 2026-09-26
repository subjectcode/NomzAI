from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health, vision, recommendation
from app.db.database import Base, engine

# Initialize database
Base.metadata.create_all(bind=engine)

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

app.include_router(health.router, prefix=settings.API_V1_PREFIX, tags=["Health"])
app.include_router(vision.router, prefix=f"{settings.API_V1_PREFIX}/vision", tags=["Vision"])
app.include_router(vision.router, prefix=f"{settings.API_V1_PREFIX}/ingredients", tags=["Ingredients"])
app.include_router(recommendation.router, prefix=f"{settings.API_V1_PREFIX}/recommendations", tags=["Recommendations"])
app.include_router(recommendation.router, prefix=f"{settings.API_V1_PREFIX}/recipes/recommend", tags=["Recommendations"])


@app.get("/")
def root():
    return {
        "service": "nomz-api",
        "status": "online",
        "docs": f"{settings.API_V1_PREFIX}/docs",
        "health": f"{settings.API_V1_PREFIX}/health",
    }
