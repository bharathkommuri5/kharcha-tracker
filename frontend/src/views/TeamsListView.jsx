import { useState } from "react";
import { TeamAvatar } from "../components/Avatar.jsx";
import NewTeamModal from "../components/NewTeamModal.jsx";
import { Button, Card, EmptyState, Spinner } from "../components/ui/index.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTeams } from "../context/TeamsContext.jsx";

export default function TeamsListView({ onOpenTeam }) {
  const { teams, loading } = useTeams();
  const { isSuperadmin } = useAuth();
  const [newOpen, setNewOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-fg">Teams</h1>
        {isSuperadmin && <Button size="sm" onClick={() => setNewOpen(true)}>＋ New team</Button>}
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-faint">
          <Spinner className="h-6 w-6" />
        </div>
      ) : teams.length === 0 ? (
        <Card>
          <EmptyState icon="👥" title="No teams yet">
            {isSuperadmin
              ? "Create a team and add members to see combined spending."
              : "A super admin can add you to a team."}
          </EmptyState>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <button
              key={t.id}
              onClick={() => onOpenTeam(t.id)}
              className="flex items-center gap-3 rounded-2xl bg-surface p-4 text-left shadow-card ring-1 ring-line/70 transition hover:shadow-card-hover"
            >
              <TeamAvatar team={t} size={44} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-fg">{t.name}</span>
                <span className="block text-xs text-faint">
                  {t.member_count} member{t.member_count === 1 ? "" : "s"} · {t.role}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      <NewTeamModal open={newOpen} onClose={() => setNewOpen(false)} onCreated={(t) => onOpenTeam(t.id)} />
    </div>
  );
}
