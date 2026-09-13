def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Campus Intelligence 360"
    assert "version" in data


def test_health_check_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["ok", "degraded"]
    assert data["project_name"] == "Campus Intelligence 360"
    assert "database" in data
    assert "connected" in data["database"]
    assert "latency_ms" in data["database"]
    assert "dialect" in data["database"]
