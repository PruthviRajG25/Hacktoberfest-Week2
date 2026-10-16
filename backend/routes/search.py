from fastapi import APIRouter
from backend.models import SearchRequest, SearchResponse
from backend.services.embedding_service import embedding_service

router = APIRouter(prefix="/api/search", tags=["Semantic & Vector Search"])


@router.post("", response_model=SearchResponse)
async def search_listings(req: SearchRequest):
    """
    Search listings using MongoDB Atlas Vector Search ($vectorSearch).
    If Vector Search is unconfigured, falls back gracefully and truthfully to text filtering.
    """
    return await embedding_service.search(req)
