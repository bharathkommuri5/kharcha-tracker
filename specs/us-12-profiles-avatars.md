# US-12 — User profiles & avatar images

**As a** user
**I want** a profile page where I can set a display picture and username
**So that** the app feels personal and I'm recognisable in a team.

## Design

### Data model
New `Image` table (shared by user + team avatars):
| field | type |
|---|---|
| id | int PK |
| token | str, uuid4 hex, unique, indexed |
| data | bytes (resized JPEG/PNG, typ. < 40 KB) |
| content_type | str |
| created_at | datetime |

`User` gains `avatar_image_id: int | None` (FK → image.id).

### Image handling
- `Pillow` added to requirements.
- Upload accepted as multipart (`file`). Reject > 4 MB or non-image.
- Resize to fit 256×256 (cover), strip metadata, re-encode: JPEG q82, or PNG if alpha.
- Stored as a new `Image` row; old avatar image row deleted.

### Endpoints
- `GET /images/{token}` — **public**, returns the bytes with `Cache-Control: public, max-age=604800`. Token is unguessable so no auth needed.
- `POST /auth/me/avatar` (multipart) → stores image, sets `avatar_image_id`, returns `UserRead`.
- `DELETE /auth/me/avatar` → clears it.
- `GET /auth/me` / `PATCH /auth/me` responses now include `avatar_url` (`/images/{token}` or null) and `is_superadmin` (bool).

### Frontend
- `AvatarUploader` component: shows current image or initials; click → file picker → preview → `POST`. "Remove photo" when set.
- New **Profile view** (reached by clicking the sidebar user row): avatar uploader, editable username, read-only name + email, super-admin badge, sign out.
- Sidebar user row + all avatar spots render the image when present, initials otherwise.
- **Theme toggle moves to the top-right** — a slim top bar on desktop (`hidden lg:flex`, right-aligned toggle); stays top-right on the mobile bar. Removed from the sidebar footer.

## Acceptance criteria
- [ ] Upload jpg/png → avatar shows in profile + sidebar immediately; persists after reload.
- [ ] Large / non-image upload rejected with a clear message.
- [ ] Remove photo → falls back to initials.
- [ ] `GET /images/{token}` works unauthenticated; unknown token → 404.
- [ ] Theme toggle is top-right on both desktop and mobile; choice still persists.

## Implementation notes (2026-09-01)
- Backend: `Image` table, `app/services/images.py` (Pillow cover-crop → 256px JPEG/PNG),
  `GET /images/{token}` public, `POST/DELETE /auth/me/avatar`. `UserRead` now carries
  `avatar_url` + `is_superadmin` (built by `app/presenters.py`).
- Frontend: `Avatar.jsx` (`UserAvatar`/`TeamAvatar`), `AvatarUploader.jsx`, `views/ProfileView.jsx`
  (reached via sidebar user row / mobile avatar). Sidebar + mobile bar render the photo.
- Theme toggle moved to the **top-right**: a slim desktop top bar (`DashboardPage`) and the mobile
  top bar; removed from the sidebar footer.
- Tests: `tests/test_profile.py` (5) + live browser (upload, serve, dark toggle).

## Status: 🟢 Done (live-tested)
