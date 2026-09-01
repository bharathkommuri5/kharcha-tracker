def test_me_includes_new_fields(client, auth_headers):
    h = auth_headers("alice@example.com", "Alice")
    me = client.get("/auth/me", headers=h).json()
    assert me["avatar_url"] is None
    assert me["is_superadmin"] is False


def test_superadmin_flag(client, auth_headers):
    h = auth_headers("admin@example.com", "Admin")
    assert client.get("/auth/me", headers=h).json()["is_superadmin"] is True


def test_avatar_upload_and_serve(client, auth_headers, png_bytes):
    h = auth_headers()
    r = client.post(
        "/auth/me/avatar", headers=h, files={"file": ("a.png", png_bytes, "image/png")}
    )
    assert r.status_code == 200, r.text
    url = r.json()["avatar_url"]
    assert url and url.startswith("/images/")

    img = client.get(url)  # public, no auth
    assert img.status_code == 200
    assert img.headers["content-type"] in ("image/jpeg", "image/png")
    assert len(img.content) > 100

    # replace + remove
    r2 = client.post(
        "/auth/me/avatar", headers=h, files={"file": ("b.png", png_bytes, "image/png")}
    )
    assert r2.json()["avatar_url"] != url  # new token
    assert client.get(url).status_code == 404  # old image deleted

    cleared = client.delete("/auth/me/avatar", headers=h)
    assert cleared.json()["avatar_url"] is None


def test_avatar_rejects_non_image(client, auth_headers):
    h = auth_headers()
    r = client.post(
        "/auth/me/avatar", headers=h, files={"file": ("x.txt", b"not an image", "text/plain")}
    )
    assert r.status_code == 422


def test_unknown_image_token_404(client):
    assert client.get("/images/deadbeef").status_code == 404
