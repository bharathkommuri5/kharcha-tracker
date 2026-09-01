# US-13 — Teams & combined expense view

**As a** super admin
**I want** to create teams and add members
**So that** a group can see their combined spending in one place.

## Design

### Roles
- **Super admin** — email is in `SUPERADMIN_EMAILS` (csv env). Can create/edit/delete any team,
  manage any team's members and avatar, list all users.
- **Team admin** — `TeamMembership.role == "admin"` (the creator, or promoted). Can manage that
  team's members + avatar + name.
- **Member** — sees the team and its combined view; cannot manage.

### Data model
`Team`:
| field | type |
|---|---|
| id | int PK |
| name | str |
| avatar_image_id | int \| None (FK image.id) |
| created_by_user_id | int (FK user.id) |
| created_at | datetime |

`TeamMembership`:
| field | type |
|---|---|
| id | int PK |
| team_id | int (FK) |
| user_id | int (FK) |
| role | enum `admin` \| `member` |
| created_at | datetime |
| unique (team_id, user_id) |

Combined view reuses each member's own `Transaction` rows — no new expense table. Members keep
logging expenses normally; the team view aggregates across all members.

### Endpoints
- `GET /users?q=&limit=` — super-admin only. `{id,name,username,email,avatar_url}`.
- `GET /teams` — teams the caller is a member of: `{id,name,avatar_url,role,member_count}`.
- `POST /teams` `{name}` — super-admin only; caller auto-added as `admin` member.
- `GET /teams/{id}` — members only. Team + members `[{user:{...}, role}]`.
- `PATCH /teams/{id}` `{name}` — super-admin or team admin.
- `DELETE /teams/{id}` — super-admin.
- `POST /teams/{id}/avatar` (multipart) / `DELETE /teams/{id}/avatar` — super-admin or team admin.
- `POST /teams/{id}/members` `{user_id, role?}` — super-admin or team admin. 409 if already a member.
- `DELETE /teams/{id}/members/{user_id}` — super-admin or team admin. Cannot remove the last admin.
- `GET /teams/{id}/analytics/summary?start=&end=` — members only. Same shape as `/analytics/summary`
  but summed over every member's transactions; adds `by_member: [{user_id,name,total}]`.
- `GET /teams/{id}/transactions?start=&end=` — members only. Merged, each row carries `member`
  `{id,name,avatar_url}`. Read-only (you edit your own from the personal views).

All scoped/permission-checked; non-members get 404 on team routes.

### Frontend
- Sidebar: a **Teams** section under the main nav — each team (avatar + name), click → Team view.
  Super admin sees **＋ New team**.
- **Team view**: header (team avatar + name + member avatars), combined `HeroBalance`, member
  breakdown (who spent what), category donut + payment bar + daily trend (team data), merged
  transaction list with a member avatar on each row. Month nav shared with the rest of the app.
- **Manage team** (admin only) → modal: rename, team avatar uploader, member list with remove,
  "Add member" → searches `GET /users`, pick → `POST members`.
- `TeamAvatar` / `UserAvatar` components (image or initials, sized).

## Acceptance criteria
- [ ] Non-super-admin cannot see New team / create; `POST /teams` → 403.
- [ ] Super admin creates a team, adds 2 members → team appears in all three users' sidebars.
- [ ] Team view total = sum of all members' expenses for the month; `by_member` correct.
- [ ] Merged transaction list shows each member's rows with their avatar; read-only.
- [ ] Remove member → team disappears from that user's sidebar; their spend leaves the totals.
- [ ] Team avatar upload shows everywhere the team is listed.
- [ ] Delete team → gone for everyone.

## Implementation notes (2026-09-01)
- Backend: `Team` + `TeamMembership` tables, `TeamRole` enum. `SUPERADMIN_EMAILS` env →
  `is_superadmin` / `SuperAdmin` dep. Routers: `app/routers/users.py` (`GET /users`, super-admin),
  `app/routers/teams.py` (list/create/detail/patch/delete, members add/remove, avatar,
  `/analytics/summary` with `by_member`, merged `/transactions`). `analytics.summarize_users`
  generalises the personal aggregator to a set of user ids.
- Frontend: `TeamsContext`, sidebar "Your teams" section + `views/TeamsListView.jsx`,
  `views/TeamView.jsx` (combined hero, by-member + category breakdown, charts, merged tx list),
  `TeamManageModal.jsx` + `MemberPicker.jsx` (admin only), `NewTeamModal.jsx`.
- Charts refactored to take `summary`/`options` props so Overview and Team reuse them.
- Tests: `tests/test_teams.py` (6) — permissions, combined totals, `by_member`, member removal,
  last-admin guard, avatar. Live browser: super-admin created "Household", added 2 members,
  team total ₹3,700 = sum of members, visible in sidebar, dark + mobile.

## Status: 🟢 Done (live-tested)
