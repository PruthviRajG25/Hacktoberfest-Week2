import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple

from backend.models import (
    ProductInput,
    GeneratedListing,
    GenerateResponse,
    GenerateRequest,
    ListingDocument,
    ListingListResponse,
    ListingUpdateRequest,
    BrandProfile,
    RegenerateSectionRequest,
    RegenerateSectionResponse
)
from backend.database import db_manager
from backend.ai.providers import get_ai_provider, AIProviderUnavailableError, AIProviderError
from backend.config import settings

logger = logging.getLogger("open_list.listing_service")

SAMPLE_PRESETS = [
    {
        "id": "preset-ceramic-mug",
        "label": "Handmade Ceramic Mug (Etsy)",
        "product_name": "Artisan Stoneware Ceramic Mug",
        "category": "Handmade Kitchenware & Pottery",
        "features_and_specs": "14 oz capacity, wheel-thrown speckled stoneware clay, raw unglazed base with a satin sage green glaze, ergonomic thumb-rest handle, microwave and dishwasher safe.",
        "price": 38.00,
        "currency": "USD",
        "target_audience": "Coffee aficionados, home baristas, lovers of cozy minimalist home goods",
        "brand_name": "Earth & Kiln Studio",
        "brand_voice": "Friendly",
        "marketplace": "Etsy",
        "output_language": "English"
    },
    {
        "id": "preset-soy-candle",
        "label": "Organic Soy Candle (Instagram)",
        "product_name": "French Lavender & Cedarwood Soy Candle",
        "category": "Home Fragrance & Wellness",
        "features_and_specs": "8 oz amber glass jar, 100% natural USA-grown soy wax, crackling FSC-certified wood wick, pure essential oil blend, 45-50 hour clean burn time, phthalate-free and vegan.",
        "price": 26.00,
        "currency": "USD",
        "target_audience": "Mindfulness enthusiasts, self-care seekers, aromatherapy lovers, gift buyers",
        "brand_name": "Botanical Hearth",
        "brand_voice": "Minimalist",
        "marketplace": "Instagram",
        "output_language": "English"
    },
    {
        "id": "preset-leather-wallet",
        "label": "Leather Cardholder (General Ecom)",
        "product_name": "Slim Handcrafted Full-Grain Leather Cardholder",
        "category": "Leather Goods & Accessories",
        "features_and_specs": "Vegetable-tanned full-grain Italian leather, saddle stitched by hand with waxed polycord thread, holds 6-8 cards plus folded cash, beveled burnished edges with natural beeswax, RFID protection.",
        "price": 49.00,
        "currency": "USD",
        "target_audience": "Everyday carry (EDC) enthusiasts, minimalist professionals, quality craft admirers",
        "brand_name": "Heritage Stitch & Hide",
        "brand_voice": "Premium",
        "marketplace": "General ecommerce",
        "output_language": "English"
    },
    {
        "id": "preset-bamboo-whisk",
        "label": "Artisan Matcha Whisk (eBay)",
        "product_name": "100-Prong Golden Bamboo Chasen Matcha Whisk",
        "category": "Tea Accessories & Japanese Crafts",
        "features_and_specs": "Carved from a single piece of sustainable golden bamboo, 100 finely curved flexible prongs for frothing micro-foam, includes ceramic whisk keeper stand, 100% natural and food safe, no chemical treatments.",
        "price": 24.50,
        "currency": "USD",
        "target_audience": "Matcha lovers, Japanese tea ceremony practitioners, wellness enthusiasts",
        "brand_name": "Komorebi Tea Co.",
        "brand_voice": "Professional",
        "marketplace": "eBay",
        "output_language": "English"
    }
]


class ListingService:
    def __init__(self):
        self.provider = get_ai_provider()

    async def generate_and_save(self, req: GenerateRequest) -> GenerateResponse:
        """Call AI provider and save generated listing to database."""
        brand_profile_obj: Optional[BrandProfile] = None
        if req.apply_brand_profile:
            bp_dict = db_manager.get_brand_profile()
            if bp_dict:
                brand_profile_obj = BrandProfile(**bp_dict)

        # Call AI Provider
        listing = await self.provider.generate_listing(req.product_input, brand_profile_obj)

        # Generate embedding asynchronously if possible
        embed_text = f"{req.product_input.product_name}. {req.product_input.category}. {listing.title}. {listing.description}"
        embedding = await self.provider.get_embedding(embed_text)

        doc_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        listing_doc = {
            "_id": doc_id,
            "product_input": req.product_input.model_dump(),
            "generated_listing": listing.model_dump(),
            "created_at": now,
            "updated_at": now,
            "is_sample": False,
            "ai_model_used": getattr(self.provider, "model", "open-weight-ai"),
            "embedding": embedding
        }

        db_manager.save_listing(listing_doc)

        return GenerateResponse(
            listing_id=doc_id,
            product_input=req.product_input,
            generated_listing=listing,
            model_used=getattr(self.provider, "model", "open-weight-ai"),
            provider=settings.AI_PROVIDER,
            created_at=now,
            is_sample=False
        )

    async def regenerate_section(self, req: RegenerateSectionRequest) -> RegenerateSectionResponse:
        """Regenerate a specific section like title, description, keywords, etc."""
        content = await self.provider.regenerate_section(
            section=req.section,
            product_input=req.product_input,
            current_content=req.current_content,
            custom_instruction=req.custom_instruction
        )
        return RegenerateSectionResponse(
            section=req.section,
            content=content,
            model_used=getattr(self.provider, "model", "open-weight-ai")
        )

    def list_listings(self, page: int = 1, limit: int = 20, search: Optional[str] = None) -> ListingListResponse:
        """Retrieve paginated listings."""
        items, total = db_manager.list_listings(page=page, limit=limit, search=search)
        parsed_items: List[ListingDocument] = []
        for item in items:
            try:
                parsed_items.append(ListingDocument(**item))
            except Exception as e:
                logger.error(f"Error parsing listing document {item.get('_id')}: {e}")
        return ListingListResponse(items=parsed_items, total=total, page=page, limit=limit)

    def get_listing(self, listing_id: str) -> Optional[ListingDocument]:
        """Fetch single listing by ID."""
        doc = db_manager.get_listing(listing_id)
        if doc:
            return ListingDocument(**doc)
        return None

    def update_listing(self, listing_id: str, req: ListingUpdateRequest) -> Optional[ListingDocument]:
        """Update an editable listing."""
        fields: Dict[str, Any] = {
            "generated_listing": req.generated_listing.model_dump(),
            "updated_at": datetime.now(timezone.utc)
        }
        if req.product_input:
            fields["product_input"] = req.product_input.model_dump()
            
        doc = db_manager.update_listing(listing_id, fields)
        if doc:
            return ListingDocument(**doc)
        return None

    def delete_listing(self, listing_id: str) -> bool:
        """Delete listing."""
        return db_manager.delete_listing(listing_id)

    def get_sample_presets(self) -> List[Dict[str, Any]]:
        """Return predefined sample products for instant demo usage."""
        return SAMPLE_PRESETS


listing_service = ListingService()
