def _seed(client, h):
    rows = [
        {"amount": "200.00", "category": "food_beverages", "payment_mode": "gpay", "transaction_date": "2026-04-02"},
        {"amount": "300.00", "category": "food_beverages", "payment_mode": "cash", "transaction_date": "2026-04-02"},
        {"amount": "400.00", "category": "travel", "payment_mode": "credit_card", "transaction_date": "2026-04-10"},
    ]
    for r in rows:
        assert client.post("/transactions", json=r, headers=h).status_code == 201


def test_summary_math(client, auth_headers):
    h = auth_headers()
    _seed(client, h)
    s = client.get("/analytics/summary?start=2026-04-01&end=2026-04-30", headers=h).json()
    assert s["total"] == "900.00"
    assert s["transaction_count"] == 3
    assert s["top_category"]["value"] == "food_beverages"
    assert s["top_category"]["total"] == "500.00"
    assert [c["value"] for c in s["by_category"]] == ["food_beverages", "travel"]
    assert len(s["daily"]) == 30  # every day in April
    day2 = next(d for d in s["daily"] if d["date"] == "2026-04-02")
    assert day2["total"] == "500.00"


def test_summary_empty_range(client, auth_headers):
    h = auth_headers()
    s = client.get("/analytics/summary?start=2026-07-01&end=2026-07-31", headers=h).json()
    assert s["total"] == "0.00"
    assert s["top_category"] is None
    assert s["by_category"] == []


def test_report_email_dev_mode(client, auth_headers, tmp_path, monkeypatch):
    h = auth_headers("reporter@example.com", "Reporter")
    _seed(client, h)
    r = client.post("/reports/email", json={"start": "2026-04-01", "end": "2026-04-30"}, headers=h)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["dev"] is True
    assert body["to"] == "reporter@example.com"
    assert body["status"] == "saved"


def test_report_bad_range(client, auth_headers):
    h = auth_headers()
    r = client.post("/reports/email", json={"start": "2026-04-30", "end": "2026-04-01"}, headers=h)
    assert r.status_code == 422
