def test_dev_login_creates_user_once(client):
    r1 = client.post("/auth/dev-login", json={"email": "bob@example.com", "name": "Bob"})
    assert r1.status_code == 200
    body = r1.json()
    assert body["token_type"] == "bearer"
    assert body["user"]["email"] == "bob@example.com"
    assert body["user"]["username"] == "bob"
    uid = body["user"]["id"]

    r2 = client.post("/auth/dev-login", json={"email": "bob@example.com"})
    assert r2.json()["user"]["id"] == uid  # same user reused


def test_username_collision_gets_suffix(client):
    a = client.post("/auth/dev-login", json={"email": "sam@a.com", "name": "Sam"}).json()
    b = client.post("/auth/dev-login", json={"email": "sam@b.com", "name": "Sam"}).json()
    assert a["user"]["username"] == "sam"
    assert b["user"]["username"] == "sam2"


def test_me_requires_token(client):
    assert client.get("/auth/me").status_code == 401
    assert client.get("/auth/me", headers={"Authorization": "Bearer garbage"}).status_code == 401


def test_me_and_username_update(client, auth_headers):
    h = auth_headers("carol@example.com", "Carol")
    me = client.get("/auth/me", headers=h)
    assert me.status_code == 200 and me.json()["username"] == "carol"

    upd = client.patch("/auth/me", json={"username": "carol_the_great"}, headers=h)
    assert upd.status_code == 200 and upd.json()["username"] == "carol_the_great"


def test_username_conflict_returns_409(client, auth_headers):
    auth_headers("dan@example.com", "Dan")  # creates username "dan"
    h2 = auth_headers("dana@example.com", "Dana")
    r = client.patch("/auth/me", json={"username": "dan"}, headers=h2)
    assert r.status_code == 409


def test_google_login_unconfigured(client):
    # GOOGLE_CLIENT_ID is empty in tests
    r = client.post("/auth/google", json={"id_token": "x" * 20})
    assert r.status_code == 503
