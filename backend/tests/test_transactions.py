from datetime import date


def _mk(client, h, **over):
    payload = {
        "amount": "100.00",
        "category": "food_beverages",
        "payment_mode": "gpay",
        "transaction_date": date.today().isoformat(),
    }
    payload.update(over)
    return client.post("/transactions", json=payload, headers=h)


def test_crud_flow(client, auth_headers):
    h = auth_headers()
    r = _mk(client, h, amount="250.50", note="lunch")
    assert r.status_code == 201, r.text
    tx = r.json()
    assert tx["amount"] == "250.50"

    lst = client.get("/transactions", headers=h).json()
    assert len(lst) == 1

    upd = client.patch(f"/transactions/{tx['id']}", json={"amount": "300.00"}, headers=h)
    assert upd.status_code == 200 and upd.json()["amount"] == "300.00"

    d = client.delete(f"/transactions/{tx['id']}", headers=h)
    assert d.status_code == 204
    assert client.get("/transactions", headers=h).json() == []


def test_validation(client, auth_headers):
    h = auth_headers()
    assert _mk(client, h, amount="0").status_code == 422
    assert _mk(client, h, amount="-5").status_code == 422
    assert _mk(client, h, category="not_real").status_code == 422


def test_date_range_filter(client, auth_headers):
    h = auth_headers()
    _mk(client, h, transaction_date="2026-01-10")
    _mk(client, h, transaction_date="2026-02-15")
    _mk(client, h, transaction_date="2026-03-20")

    both = client.get("/transactions?start=2026-01-01&end=2026-02-28", headers=h).json()
    assert len(both) == 2
    one = client.get("/transactions?start=2026-02-01&end=2026-02-28", headers=h).json()
    assert len(one) == 1


def test_isolation_between_users(client, auth_headers):
    ha = auth_headers("owner@example.com", "Owner")
    hb = auth_headers("intruder@example.com", "Intruder")
    tx = _mk(client, ha).json()

    assert client.get("/transactions", headers=hb).json() == []
    assert client.patch(f"/transactions/{tx['id']}", json={"amount": "1"}, headers=hb).status_code == 404
    assert client.delete(f"/transactions/{tx['id']}", headers=hb).status_code == 404


def test_bad_range_422(client, auth_headers):
    h = auth_headers()
    assert client.get("/transactions?start=2026-05-01&end=2026-04-01", headers=h).status_code == 422
