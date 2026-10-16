import logging
from typing import List, Optional
from datetime import datetime, timezone
from backend.models import SearchRequest, SearchResponse, SearchResultItem
from backend.database import db_manager, VectorSearchNotConfiguredError
from backend.ai.providers import get_ai_provider

logger = logging.getLogger("open_list.embeddings")

class EmbeddingService:
    def __init__(self):
        self.provider = get_ai_provider()

    async def generate_embedding(self, text: str) -> Optional[List[float]]:
        """Generate embedding vector for a given text snippet."""
        return await self.provider.get_embedding(text)

    async def search(self, req: SearchRequest) -> SearchResponse:
        """
        Execute semantic vector search if configured, with an explicit, truthful fallback
        to MongoDB text/regex filtering when Atlas Vector Search index is not yet configured.
        """
        query = req.query.strip()
        limit = req.limit

        # Step 1: Attempt to obtain query embedding
        query_vector = await self.generate_embedding(query)

        # Step 2: Try Atlas $vectorSearch if vector is available
        if query_vector:
            try:
                raw_results = db_manager.execute_vector_search(query_vector, limit=limit)
                results: List[SearchResultItem] = []
                for item in raw_results:
                    p_in = item.get("product_input", {})
                    g_list = item.get("generated_listing", {})
                    results.append(
                        SearchResultItem(
                            id=item.get("_id", ""),
                            product_name=p_in.get("product_name", "Untitled Product"),
                            category=p_in.get("category", "General"),
                            title=g_list.get("title", ""),
                            snippet=g_list.get("description", "")[:180] + "...",
                            created_at=item.get("created_at", datetime.now(timezone.utc)),
                            score=item.get("score"),
                            is_sample=item.get("is_sample", False)
                        )
                    )
                return SearchResponse(
                    query=query,
                    results=results,
                    search_method="vector_search",
                    vector_search_available=True,
                    message=f"Semantic Vector Search active: retrieved {len(results)} relevant items using MongoDB Atlas $vectorSearch."
                )
            except VectorSearchNotConfiguredError as e:
                logger.info(f"Vector search not ready ({e}). Falling back to text search.")
            except Exception as e:
                logger.warning(f"Vector search execution issue: {e}. Falling back to text search.")

        # Step 3: Graceful, truthful fallback to text search
        text_items, total = db_manager.list_listings(page=1, limit=limit, search=query)
        fallback_results: List[SearchResultItem] = []
        for item in text_items:
            p_in = item.get("product_input", {})
            g_list = item.get("generated_listing", {})
            fallback_results.append(
                SearchResultItem(
                    id=item.get("_id", ""),
                    product_name=p_in.get("product_name", "Untitled Product"),
                    category=p_in.get("category", "General"),
                    title=g_list.get("title", ""),
                    snippet=g_list.get("description", "")[:180] + "...",
                    created_at=item.get("created_at", datetime.now(timezone.utc)),
                    score=None,
                    is_sample=item.get("is_sample", False)
                )
            )

        status_explanation = (
            "MongoDB Atlas Vector Search index is not yet enabled or local embeddings are unconfigured. "
            "Displaying results via keyword & text matching fallback."
        )

        return SearchResponse(
            query=query,
            results=fallback_results,
            search_method="text_fallback",
            vector_search_available=False,
            message=status_explanation
        )

embedding_service = EmbeddingService()
