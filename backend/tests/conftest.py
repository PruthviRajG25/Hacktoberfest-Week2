import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import db_manager

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture(autouse=True)
def reset_db():
    """Reset database samples between tests."""
    db_manager.seed_demo_samples_if_empty()
    yield
