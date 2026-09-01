import { useCallback, useEffect, useState } from "react";
import { TeamAvatar, UserAvatar } from "../components/Avatar.jsx";
import CategoryBreakdown from "../components/CategoryBreakdown.jsx";
import HeroBalance from "../components/HeroBalance.jsx";
import MonthNav from "../components/MonthNav.jsx";
import TeamManageModal from "../components/TeamManageModal.jsx";
import CategoryDonut from "../components/charts/CategoryDonut.jsx";
import DailyTrend from "../components/charts/DailyTrend.jsx";
import PaymentBar from "../components/charts/PaymentBar.jsx";
import { Button, Card, EmptyState, Spinner } from "../components/ui/index.jsx";
import { useDashboard } from "../context/DashboardContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { formatDayMonth, formatINR } from "../lib/format.js";
import { ChevronLeft } from "../lib/icons.js";
import api, { apiErrorMessage } from "../lib/api.js";

function MemberBreakdown({ byMember, total }) {
  if (!byMember?.length) return null;
  const max = Number(total || 0) || 1;
  return (
    <Card className="p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-fg">By member</h3>
      <ul className="mt-4 space-y-3">
        {byMember.map((m) => {
          const pct = Math.round((Number(m.total) / max) * 100);
          return (
            <li key={m.user_id}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-fg">
                  <UserAvatar user={m} size={22} /> {m.name}
                </span>
                <span className="tabular-nums text-muted">
                  {formatINR(m.total)} <span className="text-faint">· {pct}%</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(pct, 3)}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function TeamTransactions({ rows, options }) {
  const catMeta = {};
  (options?.categories || []).forEach((c) => (catMeta[c.value] = c));
  if (!rows.length) {
    return (
      <Card>
        <EmptyState icon="🧾" title="No team expenses this month" />
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line px-4 py-3 text-sm font-semibold text-fg">
        All team transactions
      </div>
      <ul className="divide-y divide-line">
        {rows.map((t) => {
          const m = catMeta[t.category] || { icon: "•", label: t.category, color: "#94a3b8" };
          return (
            <li key={t.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
                style={{ backgroundColor: `${m.color}22` }}
              >
                {m.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-fg">{m.label}</p>
                <p className="flex items-center gap-1.5 truncate text-xs text-faint">
                  <UserAvatar user={t.member} size={14} />
                  {t.member.name} · {formatDayMonth(t.transaction_date)}
                  {t.note ? ` · ${t.note}` : ""}
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold tabular-nums text-fg">{formatINR(t.amount)}</p>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export default function TeamView({ teamId, onLeave }) {
  const { range, options } = useDashboard();
  const toast = useToast();
  const [detail, setDetail] = useState(null);
  const [summary, setSummary] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const [d, s, t] = await Promise.all([
        api.get(`/teams/${teamId}`),
        api.get(`/teams/${teamId}/analytics/summary`, { params: { start: range.start, end: range.end } }),
        api.get(`/teams/${teamId}/transactions`, { params: { start: range.start, end: range.end } }),
      ]);
      setDetail(d.data);
      setSummary(s.data);
      setTxns(t.data);
    } catch (e) {
      if (e?.response?.status === 404) setNotFound(true);
      else toast.error(apiErrorMessage(e, "Could not load team"));
    } finally {
      setLoading(false);
    }
  }, [teamId, range.start, range.end, toast]);

  useEffect(() => {
    load();
  }, [load, tick]);

  const isAdmin = detail?.my_role === "admin";

  if (notFound) {
    return (
      <Card>
        <EmptyState icon="🚫" title="Team unavailable">
          You’re no longer a member of this team.{" "}
          <button onClick={onLeave} className="font-semibold text-accent underline">
            Back to teams
          </button>
        </EmptyState>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onLeave} className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-fg" aria-label="Back">
            <ChevronLeft size={16} strokeWidth={2.25} />
          </button>
          {detail && <TeamAvatar team={detail} size={32} />}
          <h1 className="text-lg font-bold text-fg">{detail?.name || "Team"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <MonthNav />
          {isAdmin && (
            <Button size="sm" variant="secondary" onClick={() => setManageOpen(true)}>
              Manage
            </Button>
          )}
        </div>
      </div>

      {detail && (
        <div className="flex -space-x-2">
          {detail.members.slice(0, 8).map((m) => (
            <UserAvatar key={m.user.id} user={m.user} size={28} className="ring-2 ring-bg" />
          ))}
          {detail.members.length > 8 && (
            <span className="grid h-7 w-7 place-items-center rounded-full bg-surface-2 text-[11px] font-semibold text-muted ring-2 ring-bg">
              +{detail.members.length - 8}
            </span>
          )}
        </div>
      )}

      {loading && !summary ? (
        <div className="flex justify-center py-16 text-faint">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <>
          <HeroBalance summary={summary} range={range} label="Team spent" />
          <div className="grid gap-4 lg:grid-cols-2">
            <MemberBreakdown byMember={summary?.by_member} total={summary?.total} />
            <CategoryBreakdown summary={summary} options={options} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <CategoryDonut summary={summary} options={options} />
            <PaymentBar summary={summary} />
          </div>
          <DailyTrend summary={summary} />
          <TeamTransactions rows={txns} options={options} />
        </>
      )}

      {manageOpen && (
        <TeamManageModal
          teamId={teamId}
          open
          onClose={() => setManageOpen(false)}
          onChanged={() => setTick((n) => n + 1)}
          onDeleted={onLeave}
        />
      )}
    </div>
  );
}
