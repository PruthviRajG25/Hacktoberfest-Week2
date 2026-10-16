from unittest.mock import AsyncMock, patch
from backend.models import GeneratedListing, ProductInput
from backend.ai.providers import AIProviderUnavailableError

def test_get_listings(client):
    response = client.get("/api/listings")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) >= 1

def test_get_single_listing(client):
    # Fetch first listing
    list_res = client.get("/api/listings")
    first_id = list_res.json()["items"][0]["_id"]
    
    response = client.get(f"/api/listings/{first_id}")
    assert response.status_code == 200
    assert response.json()["_id"] == first_id

def test_get_nonexistent_listing_404(client):
    response = client.get("/api/listings/non-existent-id-99999")
    assert response.status_code == 404

def test_update_listing(client):
    list_res = client.get("/api/listings")
    item = list_res.json()["items"][0]
    first_id = item["_id"]

    updated_listing = item["generated_listing"]
    updated_listing["title"] = "Updated Custom Title For Testing"

    put_res = client.put(f"/api/listings/{first_id}", json={
        "generated_listing": updated_listing,
        "product_input": item["product_input"]
    })
    assert put_res.status_code == 200
    assert put_res.json()["generated_listing"]["title"] == "Updated Custom Title For Testing"

def test_delete_listing(client):
    # Create a dummy listing to delete
    list_res = client.get("/api/listings")
    first_id = list_res.json()["items"][0]["_id"]

    del_res = client.delete(f"/api/listings/{first_id}")
    assert del_res.status_code == 204

    # Verify 404 on re-fetch
    check_res = client.get(f"/api/listings/{first_id}")
    assert check_res.status_code == 404

def test_mocked_generate_listing(client):
    mock_listing = GeneratedListing(
        title="Mocked Artisan Mug",
        description="Crafted with pure clay.",
        highlights=["Spec 1", "Spec 2"],
        keywords=["ceramic", "mug"],
        social_caption="Check out our mug! #pottery",
        call_to_action="Buy now",
        alternative_titles=["Alt Title 1"]
    )

    with patch("backend.services.listing_service.listing_service.provider.generate_listing", new_callable=AsyncMock) as mock_gen, \
         patch("backend.services.listing_service.listing_service.provider.get_embedding", new_callable=AsyncMock) as mock_embed:
        mock_gen.return_value = mock_listing
        mock_embed.return_value = [0.1, 0.2, 0.3]

        payload = {
            "product_input": {
                "product_name": "Test Mug",
                "category": "Pottery",
                "features_and_specs": "Handmade clay 12 oz capacity",
                "price": 25.0,
                "currency": "USD",
                "brand_voice": "Friendly",
                "marketplace": "Etsy",
                "output_language": "English"
            },
            "apply_brand_profile": True
        }

        response = client.post("/api/generate", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["generated_listing"]["title"] == "Mocked Artisan Mug"
        assert len(data["generated_listing"]["highlights"]) == 2

def test_ai_unavailable_returns_503(client):
    with patch("backend.services.listing_service.listing_service.provider.generate_listing", new_callable=AsyncMock) as mock_gen:
        mock_gen.side_effect = AIProviderUnavailableError("Could not connect to Ollama.")

        payload = {
            "product_input": {
                "product_name": "Test Mug",
                "category": "Pottery",
                "features_and_specs": "Handmade clay 12 oz capacity",
                "price": 25.0,
                "currency": "USD"
            }
        }

        response = client.post("/api/generate", json=payload)
        assert response.status_code == 503
        data = response.json()
        assert data["detail"]["error"] == "AI_INFERENCE_UNAVAILABLE"
        assert "resolution" in data["detail"]

def test_brand_profile_crud(client):
    get_res = client.get("/api/brand-profile")
    assert get_res.status_code == 200
    
    put_payload = {
        "brand_name": "Antigravity Artisans",
        "description": "Handcrafted goods for modern spaces",
        "preferred_tone": "Premium",
        "target_audience": "Design lovers",
        "preferred_terminology": ["artisan", "small-batch"],
        "words_to_avoid": ["cheap", "mass-produced"],
        "default_language": "English"
    }
    put_res = client.put("/api/brand-profile", json=put_payload)
    assert put_res.status_code == 200
    assert put_res.json()["brand_name"] == "Antigravity Artisans"
    assert "small-batch" in put_res.json()["preferred_terminology"]

def test_search_endpoint_truthful_fallback(client):
    search_payload = {"query": "ceramic mug", "limit": 5}
    response = client.post("/api/search", json=search_payload)
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert "search_method" in data
    assert data["search_method"] in ["vector_search", "text_fallback"]
    assert "message" in data
