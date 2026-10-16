def test_get_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "open-list-api"
    assert "timestamp" in data

def test_get_readiness(client):
    response = client.get("/api/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "ai_provider" in data
    assert "database_type" in data
    assert "details" in data
