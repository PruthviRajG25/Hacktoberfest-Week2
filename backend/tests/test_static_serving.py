def test_api_404_returns_json(client):
    response = client.get("/api/nonexistent-endpoint-xyz")
    assert response.status_code == 404
    assert response.headers.get("content-type", "").startswith("application/json")
    data = response.json()
    assert data["error"] == "API_NOT_FOUND"

def test_frontend_route_returns_html_or_fallback(client):
    response = client.get("/dashboard")
    assert response.status_code in [200, 404]
    # Check that it returns HTML (SPA entrypoint) not JSON
    assert "text/html" in response.headers.get("content-type", "")

def test_root_returns_html(client):
    response = client.get("/")
    assert response.status_code in [200, 404]
    assert "text/html" in response.headers.get("content-type", "")
