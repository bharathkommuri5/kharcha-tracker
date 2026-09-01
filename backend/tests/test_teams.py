import pytest


@pytest.fixture
def admin_h(auth_headers):
    return auth_headers("admin@example.com", "Admin")


def _mk_tx(client, h, amount, date="2026-05-05", category="food_beverages", mode="gpay"):
    return client.post(
        "/transactions",
        json={"amount": amount, "category": category, "payment_mode": mode, "transaction_date": date},
        headers=h,
    )


def _uid(client, h):
    return client.get("/auth/me", headers=h).json()["id"]


def test_non_admin_cannot_create_team(client, auth_headers):
    h = auth_headers("bob@example.com", "Bob")
    assert client.post("/teams", json={"name": "T"}, headers=h).status_code == 403
    assert client.get("/users", headers=h).status_code == 403


def test_team_lifecycle_and_combined_view(client, auth_headers, admin_h):
    # users
    bob = auth_headers("bob@example.com", "Bob")
    carol = auth_headers("carol@example.com", "Carol")
    dave = auth_headers("dave@example.com", "Dave")
    bob_id, carol_id, dave_id = _uid(client, bob), _uid(client, carol), _uid(client, dave)

    # expenses
    _mk_tx(client, bob, "200.00")
    _mk_tx(client, carol, "300.00")
    _mk_tx(client, dave, "999.00")  # not a member

    # create team + add members
    team = client.post("/teams", json={"name": "Roommates"}, headers=admin_h).json()
    tid = team["id"]
    assert team["role"] == "admin"
    client.post(f"/teams/{tid}/members", json={"user_id": bob_id}, headers=admin_h)
    client.post(f"/teams/{tid}/members", json={"user_id": carol_id}, headers=admin_h)

    # visible to members, not to dave
    assert any(t["id"] == tid for t in client.get("/teams", headers=bob).json())
    assert any(t["id"] == tid for t in client.get("/teams", headers=carol).json())
    assert not any(t["id"] == tid for t in client.get("/teams", headers=dave).json())
    assert client.get(f"/teams/{tid}", headers=dave).status_code == 404

    # combined summary = bob + carol only
    s = client.get(
        f"/teams/{tid}/analytics/summary?start=2026-05-01&end=2026-05-31", headers=bob
    ).json()
    assert s["total"] == "500.00"
    assert s["transaction_count"] == 2
    by_member = {m["name"]: m["total"] for m in s["by_member"]}
    assert by_member == {"Carol": "300.00", "Bob": "200.00"}

    # merged transactions carry member info, read-only
    txns = client.get(
        f"/teams/{tid}/transactions?start=2026-05-01&end=2026-05-31", headers=carol
    ).json()
    assert len(txns) == 2
    assert {t["member"]["name"] for t in txns} == {"Bob", "Carol"}

    # remove carol -> gone from her sidebar, totals drop
    client.request("DELETE", f"/teams/{tid}/members/{carol_id}", headers=admin_h)
    assert not any(t["id"] == tid for t in client.get("/teams", headers=carol).json())
    s2 = client.get(
        f"/teams/{tid}/analytics/summary?start=2026-05-01&end=2026-05-31", headers=bob
    ).json()
    assert s2["total"] == "200.00"

    # team admin (not superadmin) can also manage: promote bob then let bob add dave
    # bob is currently a member; admin adds him as admin-role via re-add is 409, so test remove/re-add
    # simpler: superadmin deletes team
    assert client.delete(f"/teams/{tid}", headers=admin_h).status_code == 204
    assert client.get(f"/teams/{tid}", headers=bob).status_code == 404


def test_cannot_remove_last_admin(client, auth_headers, admin_h):
    admin_id = _uid(client, admin_h)
    tid = client.post("/teams", json={"name": "Solo"}, headers=admin_h).json()["id"]
    r = client.request("DELETE", f"/teams/{tid}/members/{admin_id}", headers=admin_h)
    assert r.status_code == 400


def test_duplicate_member_409(client, auth_headers, admin_h):
    bob = auth_headers("bob@example.com", "Bob")
    bob_id = _uid(client, bob)
    tid = client.post("/teams", json={"name": "X"}, headers=admin_h).json()["id"]
    assert client.post(f"/teams/{tid}/members", json={"user_id": bob_id}, headers=admin_h).status_code == 201
    assert client.post(f"/teams/{tid}/members", json={"user_id": bob_id}, headers=admin_h).status_code == 409


def test_team_avatar(client, admin_h, png_bytes):
    tid = client.post("/teams", json={"name": "Pic"}, headers=admin_h).json()["id"]
    r = client.post(
        f"/teams/{tid}/avatar", headers=admin_h, files={"file": ("t.png", png_bytes, "image/png")}
    )
    assert r.status_code == 200
    assert r.json()["avatar_url"].startswith("/images/")
    assert client.get(r.json()["avatar_url"]).status_code == 200
