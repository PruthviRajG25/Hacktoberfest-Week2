import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.models import (
    GenerateRequest,
    GenerateResponse,
    ListingDocument,
    ListingListResponse,
    ListingUpdateRequest,
    RegenerateSectionRequest,
    RegenerateSectionResponse
)
from backend.services.listing_service import listing_service
from backend.ai.providers import AIProviderUnavailableError, AIProviderError

logger = logging.getLogger("open_list.routes.listings")

router = APIRouter(prefix="/api", tags=["Product Listings"])


@router.post("/generate", response_model=GenerateResponse, status_code=status.HTTP_201_CREATED)
async def generate_listing(req: GenerateRequest):
    """
    Generate a full ecommerce product listing using the configured open-weight model
    and save the output to MongoDB Atlas.
    """
    try:
        return await listing_service.generate_and_save(req)
    except AIProviderUnavailableError as e:
        logger.warning(f"AI Provider Unavailable: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "AI_INFERENCE_UNAVAILABLE",
                "message": str(e),
                "resolution": (
                    "If running locally on Windows: Ensure Ollama is active by running 'ollama run gemma3:1b' in a terminal. "
                    "If running on Render: Configure OPENAI_COMPATIBLE_BASE_URL and AI_PROVIDER=hosted_openai_compatible, "
                    "or explore preloaded demo records."
                )
            }
        )
    except AIProviderError as e:
        logger.error(f"AI Generation Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"error": "AI_GENERATION_FAILED", "message": str(e)}
        )
    except Exception as e:
        logger.exception("Unexpected error during listing generation")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "INTERNAL_SERVER_ERROR", "message": "Failed to generate listing. Please try again."}
        )


@router.post("/regenerate-section", response_model=RegenerateSectionResponse)
async def regenerate_section(req: RegenerateSectionRequest):
    """Regenerate a specific section of a listing (e.g. title, keywords, or social caption)."""
    try:
        return await listing_service.regenerate_section(req)
    except AIProviderUnavailableError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail={"error": "AI_UNAVAILABLE", "message": str(e)})
    except Exception as e:
        logger.error(f"Section regeneration error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"error": "REGENERATE_FAILED", "message": str(e)})


@router.get("/listings", response_model=ListingListResponse)
def get_listings(
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(default=None, description="Keyword search filter")
):
    """Retrieve saved listings with pagination and keyword filtering."""
    return listing_service.list_listings(page=page, limit=limit, search=search)


@router.get("/listings/{listing_id}", response_model=ListingDocument)
def get_single_listing(listing_id: str):
    """Retrieve a single saved listing by ID."""
    listing = listing_service.get_listing(listing_id)
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return listing


@router.put("/listings/{listing_id}", response_model=ListingDocument)
def update_listing(listing_id: str, req: ListingUpdateRequest):
    """Update editable content of a saved listing."""
    updated = listing_service.update_listing(listing_id, req)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return updated


@router.delete("/listings/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(listing_id: str):
    """Delete a listing from database."""
    success = listing_service.delete_listing(listing_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return None


@router.get("/demo/samples")
def get_demo_samples():
    """Retrieve sample product presets for quick 1-click evaluation."""
    return {"samples": listing_service.get_sample_presets()}
