from datetime import datetime, timezone
from fastapi import APIRouter
from backend.models import HealthResponse, ReadinessResponse
from backend.config import settings
from backend.database import db_manager
from backend.ai.providers import get_ai_provider

router = APIRouter(prefix="/api/health", tags=["Health & Readiness"])


@router.get("", response_model=HealthResponse)
async def get_health():
    """Basic health check endpoint."""
    return HealthResponse(
        status="ok",
        service="open-list-api",
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc)
    )


@router.get("/ready", response_model=ReadinessResponse)
async def get_readiness():
    """
    Detailed readiness probe checking:
    1. AI Inference Provider reachability and model status.
    2. MongoDB Atlas database connection status.
    3. Vector search configuration readiness.
    """
    provider = get_ai_provider()
    ai_ready, ai_msg = await provider.check_availability()
    db_ready, db_msg, is_atlas = db_manager.ping()

    overall_status = "ready" if (ai_ready and db_ready) else "degraded"
    
    return ReadinessResponse(
        status=overall_status,
        ai_provider=settings.AI_PROVIDER,
        ai_provider_ready=ai_ready,
        ai_model=getattr(provider, "model", "unknown"),
        database_connected=db_ready,
        database_type="mongodb_atlas" if is_atlas else "in_memory_fallback",
        vector_search_configured=is_atlas,
        details={
            "ai_message": ai_msg,
            "database_message": db_msg,
            "is_atlas": is_atlas,
            "vector_search_index": settings.VECTOR_SEARCH_INDEX_NAME
        }
    )
