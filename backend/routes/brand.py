from fastapi import APIRouter
from backend.models import BrandProfile
from backend.database import db_manager

router = APIRouter(prefix="/api/brand-profile", tags=["Brand Profile"])


@router.get("", response_model=BrandProfile)
def get_brand_profile():
    """Retrieve seller brand preferences (tone, audience, keywords to avoid)."""
    data = db_manager.get_brand_profile()
    return BrandProfile(**data)


@router.put("", response_model=BrandProfile)
def update_brand_profile(profile: BrandProfile):
    """Save or update seller brand preferences."""
    saved = db_manager.save_brand_profile(profile.model_dump())
    return BrandProfile(**saved)
