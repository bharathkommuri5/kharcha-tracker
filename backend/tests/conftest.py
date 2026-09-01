import os

os.environ.setdefault("DEV_AUTH", "true")
os.environ.setdefault("JWT_SECRET", "test-secret-key")
os.environ.setdefault("GOOGLE_CLIENT_ID", "")
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("SUPERADMIN_EMAILS", "admin@example.com")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app.database import get_session
from app.main import app


@pytest.fixture(name="engine")
def engine_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="client")
def client_fixture(engine):
    def _get_session():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = _get_session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client):
    def _login(email: str = "alice@example.com", name: str = "Alice"):
        r = client.post("/auth/dev-login", json={"email": email, "name": name})
        assert r.status_code == 200, r.text
        return {"Authorization": f"Bearer {r.json()['access_token']}"}

    return _login


@pytest.fixture
def png_bytes():
    """A tiny valid PNG for avatar-upload tests."""
    import io

    from PIL import Image

    buf = io.BytesIO()
    Image.new("RGB", (400, 300), (80, 120, 220)).save(buf, format="PNG")
    return buf.getvalue()
