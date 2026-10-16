import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
import pymongo
from pymongo.errors import PyMongoError, OperationFailure
from backend.config import settings

logger = logging.getLogger("open_list.database")

class VectorSearchNotConfiguredError(Exception):
    """Raised when MongoDB Atlas Vector Search index is missing or not configured."""
    pass


class DatabaseManager:
    def __init__(self):
        self.client: Optional[pymongo.MongoClient] = None
        self.db = None
        self.is_atlas: bool = False
        self._in_memory_listings: Dict[str, Dict[str, Any]] = {}
        self._in_memory_brand: Optional[Dict[str, Any]] = None
        self.connected: bool = False
        self.connection_error: Optional[str] = None
        self.init_db()

    def init_db(self):
        """Initialize connection to MongoDB Atlas or set up graceful in-memory storage."""
        if settings.MONGODB_URI and settings.MONGODB_URI.strip():
            try:
                # Set 4-second timeout to avoid long blocking if Atlas IP access is restricted
                self.client = pymongo.MongoClient(
                    settings.MONGODB_URI,
                    serverSelectionTimeoutMS=4000,
                    connectTimeoutMS=4000,
                    appname="OpenListApp"
                )
                # Verify server is reachable
                self.client.admin.command('ping')
                self.db = self.client[settings.DATABASE_NAME]
                self.is_atlas = True
                self.connected = True
                self.connection_error = None
                logger.info(f"Connected to MongoDB Atlas: {settings.DATABASE_NAME}")
                self._ensure_indexes()
            except Exception as e:
                self.connected = False
                self.connection_error = str(e)
                logger.warning(
                    f"Could not connect to MongoDB Atlas ({e}). "
                    "Falling back to resilient in-memory storage for local demo session."
                )
                self.client = None
                self.db = None
                self.is_atlas = False
        else:
            logger.info("No MONGODB_URI configured. Running in resilient in-memory development mode.")
            self.connected = False
            self.is_atlas = False
            self.connection_error = "MONGODB_URI not set. Operating with in-memory storage."

        # Ensure demo samples are ready
        self.seed_demo_samples_if_empty()

    def _ensure_indexes(self):
        """Create standard indexes for listings if on MongoDB."""
        if self.db is not None:
            try:
                self.db.listings.create_index([("created_at", pymongo.DESCENDING)])
                self.db.listings.create_index([("product_input.product_name", pymongo.TEXT), ("product_input.category", pymongo.TEXT)])
            except Exception as e:
                logger.warning(f"Could not create text indexes: {e}")

    def ping(self) -> Tuple[bool, str, bool]:
        """Check live connection status. Returns (is_healthy, message, is_atlas)."""
        if self.client and self.is_atlas:
            try:
                self.client.admin.command('ping')
                return True, "Connected to MongoDB Atlas", True
            except Exception as e:
                return False, f"Atlas connection error: {str(e)}", False
        return True, "In-memory fallback database active (Demo / Local)", False

    # Listings CRUD
    def save_listing(self, listing_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Save a new listing document."""
        if "_id" not in listing_dict or not listing_dict["_id"]:
            listing_dict["_id"] = str(uuid.uuid4())
        
        now = datetime.now(timezone.utc)
        listing_dict.setdefault("created_at", now)
        listing_dict.setdefault("updated_at", now)

        if self.db is not None and self.is_atlas:
            try:
                self.db.listings.insert_one(listing_dict)
                return listing_dict
            except Exception as e:
                logger.error(f"Error saving listing to Atlas: {e}. Storing in memory fallback.")
        
        # In-memory store
        self._in_memory_listings[listing_dict["_id"]] = listing_dict
        return listing_dict

    def get_listing(self, listing_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a listing by ID."""
        if self.db is not None and self.is_atlas:
            try:
                doc = self.db.listings.find_one({"_id": listing_id})
                if doc:
                    return doc
            except Exception as e:
                logger.error(f"Error reading listing from Atlas: {e}")

        return self._in_memory_listings.get(listing_id)

    def list_listings(self, page: int = 1, limit: int = 20, search: Optional[str] = None) -> Tuple[List[Dict[str, Any]], int]:
        """List listings with pagination and optional search filter."""
        skip = (page - 1) * limit
        
        if self.db is not None and self.is_atlas:
            try:
                query: Dict[str, Any] = {}
                if search and search.strip():
                    regex = {"$regex": search.strip(), "$options": "i"}
                    query = {
                        "$or": [
                            {"product_input.product_name": regex},
                            {"product_input.category": regex},
                            {"generated_listing.title": regex},
                            {"generated_listing.description": regex}
                        ]
                    }
                total = self.db.listings.count_documents(query)
                cursor = self.db.listings.find(query).sort("created_at", pymongo.DESCENDING).skip(skip).limit(limit)
                items = list(cursor)
                return items, total
            except Exception as e:
                logger.error(f"Error querying Atlas listings: {e}. Falling back to in-memory.")

        # In-memory list
        all_items = list(self._in_memory_listings.values())
        if search and search.strip():
            s = search.strip().lower()
            filtered = []
            for item in all_items:
                p_name = item.get("product_input", {}).get("product_name", "").lower()
                cat = item.get("product_input", {}).get("category", "").lower()
                title = item.get("generated_listing", {}).get("title", "").lower()
                desc = item.get("generated_listing", {}).get("description", "").lower()
                if s in p_name or s in cat or s in title or s in desc:
                    filtered.append(item)
            all_items = filtered

        # Sort descending by created_at
        all_items.sort(key=lambda x: str(x.get("created_at", "")), reverse=True)
        total = len(all_items)
        items = all_items[skip:skip + limit]
        return items, total

    def update_listing(self, listing_id: str, update_fields: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an existing listing."""
        update_fields["updated_at"] = datetime.now(timezone.utc)
        
        if self.db is not None and self.is_atlas:
            try:
                res = self.db.listings.find_one_and_update(
                    {"_id": listing_id},
                    {"$set": update_fields},
                    return_document=pymongo.ReturnDocument.AFTER
                )
                if res:
                    return res
            except Exception as e:
                logger.error(f"Error updating listing in Atlas: {e}")

        if listing_id in self._in_memory_listings:
            doc = self._in_memory_listings[listing_id]
            for k, v in update_fields.items():
                if k == "generated_listing" and isinstance(v, dict) and isinstance(doc.get("generated_listing"), dict):
                    doc["generated_listing"].update(v)
                elif k == "product_input" and isinstance(v, dict) and isinstance(doc.get("product_input"), dict):
                    doc["product_input"].update(v)
                else:
                    doc[k] = v
            return doc
        return None

    def delete_listing(self, listing_id: str) -> bool:
        """Delete a listing by ID."""
        if self.db is not None and self.is_atlas:
            try:
                res = self.db.listings.delete_one({"_id": listing_id})
                if res.deleted_count > 0:
                    return True
            except Exception as e:
                logger.error(f"Error deleting listing from Atlas: {e}")

        if listing_id in self._in_memory_listings:
            del self._in_memory_listings[listing_id]
            return True
        return False

    # Brand Profile
    def get_brand_profile(self) -> Dict[str, Any]:
        """Retrieve brand profile or return default empty profile."""
        default_profile = {
            "brand_name": "",
            "description": "",
            "preferred_tone": "Friendly",
            "target_audience": "",
            "preferred_terminology": [],
            "words_to_avoid": [],
            "default_language": "English",
            "updated_at": None
        }
        if self.db is not None and self.is_atlas:
            try:
                doc = self.db.brand_profiles.find_one({"_id": "default_brand_profile"})
                if doc:
                    doc.pop("_id", None)
                    return doc
            except Exception as e:
                logger.error(f"Error reading brand profile from Atlas: {e}")

        if self._in_memory_brand:
            return self._in_memory_brand
        return default_profile

    def save_brand_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save or update the single brand profile."""
        profile_data["updated_at"] = datetime.now(timezone.utc)
        if self.db is not None and self.is_atlas:
            try:
                self.db.brand_profiles.update_one(
                    {"_id": "default_brand_profile"},
                    {"$set": profile_data},
                    upsert=True
                )
                return profile_data
            except Exception as e:
                logger.error(f"Error saving brand profile to Atlas: {e}")

        self._in_memory_brand = profile_data
        return profile_data

    # Vector Search with Truthful Fallback
    def execute_vector_search(self, query_vector: List[float], limit: int = 10) -> List[Dict[str, Any]]:
        """
        Execute MongoDB Atlas $vectorSearch aggregation pipeline.
        Raises VectorSearchNotConfiguredError if the index is missing or not running on Atlas.
        """
        if not self.is_atlas or self.db is None:
            raise VectorSearchNotConfiguredError(
                "MongoDB Atlas is not connected. Vector Search requires a live MongoDB Atlas cluster."
            )

        pipeline = [
            {
                "$vectorSearch": {
                    "index": settings.VECTOR_SEARCH_INDEX_NAME,
                    "path": "embedding",
                    "queryVector": query_vector,
                    "numCandidates": limit * 10,
                    "limit": limit
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "product_input": 1,
                    "generated_listing": 1,
                    "created_at": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]

        try:
            results = list(self.db.listings.aggregate(pipeline))
            return results
        except OperationFailure as e:
            # Code 40415 or index not found message
            err_msg = str(e)
            logger.warning(f"Vector search failed: {err_msg}")
            raise VectorSearchNotConfiguredError(
                f"Atlas Vector Search index '{settings.VECTOR_SEARCH_INDEX_NAME}' is not created or ready: {err_msg}"
            )
        except Exception as e:
            logger.warning(f"Atlas Vector Search aggregation error: {e}")
            raise VectorSearchNotConfiguredError(str(e))

    def seed_demo_samples_if_empty(self):
        """Seed high-quality demo listings so hackathon judges can immediately test the UI."""
        sample_listings = [
            {
                "_id": "sample-ceramic-mug",
                "is_sample": True,
                "ai_model_used": "gemma3:1b",
                "created_at": datetime(2026, 10, 14, 10, 30, tzinfo=timezone.utc),
                "updated_at": datetime(2026, 10, 14, 10, 30, tzinfo=timezone.utc),
                "product_input": {
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
                "generated_listing": {
                    "title": "Artisan Stoneware Ceramic Mug - 14 oz Handmade Sage Green Coffee Cup with Ergonomic Thumb Rest",
                    "description": "Start your mornings with intentional warmth. Each 14 oz mug is individually wheel-thrown using speckled stoneware clay, featuring an unglazed earthy base and a silky sage green glaze. Designed with an ergonomic thumb-rest handle for the ultimate comfortable grip, this durable mug is both microwave and dishwasher safe—perfect for daily coffee, matcha, or comforting evening teas.",
                    "highlights": [
                        "Wheel-thrown from durable speckled stoneware clay",
                        "Comfortable ergonomic handle with integrated thumb-rest",
                        "Generous 14 oz capacity for lattes, drip coffee, and tea",
                        "Food-safe, microwave-safe, and dishwasher-safe glaze",
                        "Locally crafted in small batches with unique artisanal character"
                    ],
                    "keywords": [
                        "handmade ceramic mug", "stoneware coffee cup", "pottery tea mug",
                        "sage green mug", "cozy kitchen gifts", "artisan pottery", "ceramic coffee lover gift"
                    ],
                    "social_caption": "Slow mornings just got cozier ☕✨ Meet our wheel-thrown Stoneware Mug in soothing Sage Green. Designed to fit perfectly in your hands with a custom thumb rest. Available now at the link in bio! #HandmadePottery #CoffeeLovers #CeramicArt #SlowLiving #EtsyFinds",
                    "call_to_action": "Order your handmade artisan mug today and elevate your daily morning brew!",
                    "alternative_titles": [
                        "Handmade Sage Green Stoneware Mug - 14 oz Wheel-Thrown Coffee Cup",
                        "Artisan Ceramic Coffee Mug - Ergonomic Speckled Stoneware Cup for Tea & Lattes"
                    ]
                }
            },
            {
                "_id": "sample-soy-candle",
                "is_sample": True,
                "ai_model_used": "gemma3:1b",
                "created_at": datetime(2026, 10, 15, 14, 0, tzinfo=timezone.utc),
                "updated_at": datetime(2026, 10, 15, 14, 0, tzinfo=timezone.utc),
                "product_input": {
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
                "generated_listing": {
                    "title": "Natural French Lavender & Cedarwood Soy Candle - 8 oz Amber Glass Jar with Crackling Wood Wick",
                    "description": "Transform your sanctuary with serene, grounding botanicals. Hand-poured with 100% natural American soy wax and pure essential oils of French lavender and Virginia cedarwood. Features an FSC-certified crackling wood wick that offers a gentle ambient crackle while delivering a 45+ hour clean, soot-free burn. Free from paraffin, phthalates, and synthetic dyes.",
                    "highlights": [
                        "100% clean-burning soy wax sourced from domestic farms",
                        "Aromatherapeutic blend of soothing lavender and grounding cedarwood",
                        "Natural wood wick creates a relaxing gentle hearth crackle",
                        "45 to 50 hours of long-lasting fragrance throw",
                        "Reusable amber glass apothecary jar with aluminium screw cap"
                    ],
                    "keywords": [
                        "soy candle", "wood wick candle", "lavender cedarwood candle",
                        "aromatherapy home fragrance", "clean burning candle", "vegan home gifts", "amber jar candle"
                    ],
                    "social_caption": "Unwind your mind. 🌿🕯️ Our French Lavender & Cedarwood candle blends calming floral notes with warm woodsy tones, accompanied by the gentle crackle of an authentic wood wick. Tap to shop your evening reset ritual. #SoyCandles #CleanLiving #SelfCareRitual #WoodWick #HomeFragrance",
                    "call_to_action": "Light up your evening sanctuary — add our natural lavender candle to your cart now.",
                    "alternative_titles": [
                        "Calming Lavender Cedarwood Wood-Wick Soy Candle - 8 oz Aromatherapy Amber Jar",
                        "Clean Soy Wax Candle with Wood Wick - Botanical Lavender & Cedarwood"
                    ]
                }
            },
            {
                "_id": "sample-leather-wallet",
                "is_sample": True,
                "ai_model_used": "gemma3:1b",
                "created_at": datetime(2026, 10, 16, 9, 15, tzinfo=timezone.utc),
                "updated_at": datetime(2026, 10, 16, 9, 15, tzinfo=timezone.utc),
                "product_input": {
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
                "generated_listing": {
                    "title": "Slim Full-Grain Italian Leather Cardholder Wallet - Hand-Stitched Minimalist EDC Front Pocket Bifold",
                    "description": "Crafted for longevity and timeless elegance. Hand-cut from premium vegetable-tanned Italian leather that develops a rich, personalized patina with every journey. Stitched completely by hand using traditional saddle stitch technique that will never unravel. Ultra-slim profile slips unnoticed into any front pocket while securely holding 6 to 8 cards and folded banknotes with built-in RFID blocking protection.",
                    "highlights": [
                        "Premium full-grain Italian vegetable-tanned leather",
                        "Indestructible traditional hand saddle-stitching with waxed thread",
                        "Ultra-slim front pocket silhouette: only 6mm thick when empty",
                        "Beeswax burnished and smooth edge finishing",
                        "Integrated RFID blocking keeps personal card data secure"
                    ],
                    "keywords": [
                        "minimalist leather wallet", "hand stitched cardholder", "full grain leather",
                        "front pocket wallet", "EDC wallet", "vegetable tanned leather", "mens leather gift"
                    ],
                    "social_caption": "Carry less, carry better. 💼 Engineered from vegetable-tanned Italian leather and saddle-stitched by hand for a lifetime of daily carry. Discover your new front-pocket companion. Link in bio. #LeatherCraft #EverydayCarry #MinimalistWallet #FullGrainLeather #EDCGear",
                    "call_to_action": "Upgrade your daily carry today with heirloom-grade hand-stitched leather.",
                    "alternative_titles": [
                        "Minimalist Front Pocket Leather Cardholder - Handcrafted Vegetable Tanned Wallet",
                        "Handmade Full Grain Italian Leather Wallet - Ultra-Slim RFID Card Sleeve"
                    ]
                }
            }
        ]

        for sample in sample_listings:
            sid = sample["_id"]
            if sid not in self._in_memory_listings:
                self._in_memory_listings[sid] = sample
            
            # If Atlas is connected, also ensure demo listings exist in Atlas if empty
            if self.db is not None and self.is_atlas:
                try:
                    self.db.listings.update_one(
                        {"_id": sid},
                        {"$setOnInsert": sample},
                        upsert=True
                    )
                except Exception as e:
                    logger.debug(f"Atlas sample sync note: {e}")


# Singleton instance
db_manager = DatabaseManager()
