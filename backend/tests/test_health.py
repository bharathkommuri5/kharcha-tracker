def test_root(client):
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["name"] == "kharcha-tracker"


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "db": "ok"}
