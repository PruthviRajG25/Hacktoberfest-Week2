from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, Field


class BrandVoiceEnum:
    FRIENDLY = "Friendly"
    PREMIUM = "Premium"
    MINIMALIST = "Minimalist"
    PLAYFUL = "Playful"
    PROFESSIONAL = "Professional"


class MarketplaceEnum:
    GENERAL = "General ecommerce"
    ETSY = "Etsy"
    EBAY = "eBay"
    INSTAGRAM = "Instagram"
    WHATSAPP = "WhatsApp"


class ProductInput(BaseModel):
    product_name: str = Field(..., min_length=2, max_length=150, description="Product title or primary name")
    category: str = Field(..., min_length=2, max_length=100, description="Product category (e.g. Home Decor, Jewelry)")
    features_and_specs: str = Field(..., min_length=5, max_length=3000, description="Key features, materials, dimensions, or technical specifications")
    price: Optional[float] = Field(default=None, ge=0, description="Product price")
    currency: str = Field(default="USD", max_length=10, description="Currency symbol or code (e.g. USD, EUR, INR)")
    target_audience: Optional[str] = Field(default="", max_length=250, description="Intended customer profile")
    brand_name: Optional[str] = Field(default="", max_length=100, description="Seller or brand name")
    brand_voice: str = Field(default="Friendly", description="Tone of voice: Friendly, Premium, Minimalist, Playful, Professional")
    marketplace: str = Field(default="General ecommerce", description="Target channel: General ecommerce, Etsy, eBay, Instagram, WhatsApp")
    output_language: str = Field(default="English", max_length=50, description="Output language")


class GeneratedListing(BaseModel):
    title: str = Field(..., description="SEO-friendly, high-converting product title")
    description: str = Field(..., description="Compelling and professional product description")
    highlights: List[str] = Field(default_factory=list, description="Key bullet-point highlights and benefits")
    keywords: List[str] = Field(default_factory=list, description="SEO tags and marketplace search keywords")
    social_caption: str = Field(..., description="Short, engaging social media caption with relevant hashtags")
    call_to_action: str = Field(..., description="Clear call to action encouraging purchase or inquiry")
    alternative_titles: List[str] = Field(default_factory=list, description="Alternative catchy title variations")


class GenerateRequest(BaseModel):
    product_input: ProductInput
    apply_brand_profile: bool = Field(default=True, description="Whether to incorporate saved brand profile rules")


class GenerateResponse(BaseModel):
    listing_id: str
    product_input: ProductInput
    generated_listing: GeneratedListing
    model_used: str
    provider: str
    created_at: datetime
    is_sample: bool = False


class RegenerateSectionRequest(BaseModel):
    section: str = Field(..., description="Section to regenerate: title, description, highlights, keywords, social_caption, or call_to_action")
    product_input: ProductInput
    current_content: Optional[str] = None
    custom_instruction: Optional[str] = None


class RegenerateSectionResponse(BaseModel):
    section: str
    content: str | List[str]
    model_used: str


class ListingDocument(BaseModel):
    id: str = Field(..., alias="_id")
    product_input: ProductInput
    generated_listing: GeneratedListing
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_sample: bool = False
    ai_model_used: Optional[str] = None
    embedding: Optional[List[float]] = None

    model_config = {"populate_by_name": True}


class ListingUpdateRequest(BaseModel):
    product_input: Optional[ProductInput] = None
    generated_listing: GeneratedListing


class ListingListResponse(BaseModel):
    items: List[ListingDocument]
    total: int
    page: int
    limit: int


class BrandProfile(BaseModel):
    brand_name: str = Field(default="", max_length=100)
    description: Optional[str] = Field(default="", max_length=1000)
    preferred_tone: str = Field(default="Friendly")
    target_audience: Optional[str] = Field(default="", max_length=250)
    preferred_terminology: List[str] = Field(default_factory=list)
    words_to_avoid: List[str] = Field(default_factory=list)
    default_language: str = Field(default="English", max_length=50)
    updated_at: Optional[datetime] = None


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=300)
    limit: int = Field(default=10, ge=1, le=50)


class SearchResultItem(BaseModel):
    id: str
    product_name: str
    category: str
    title: str
    snippet: str
    created_at: datetime
    score: Optional[float] = None
    is_sample: bool = False


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResultItem]
    search_method: str  # "vector_search" or "text_fallback"
    vector_search_available: bool
    message: str


class HealthResponse(BaseModel):
    status: str
    service: str = "open-list-api"
    environment: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ReadinessResponse(BaseModel):
    status: str
    ai_provider: str
    ai_provider_ready: bool
    ai_model: str
    database_connected: bool
    database_type: str  # "mongodb_atlas" or "in_memory_fallback"
    vector_search_configured: bool
    details: dict
