from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "device" in data
    assert "model_id" in data


def test_nonexistent_audio_404():
    response = client.get("/audio/nonexistent_id_12345")
    assert response.status_code == 404
