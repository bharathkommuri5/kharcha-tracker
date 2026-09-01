import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useDashboard } from "../context/DashboardContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { apiErrorMessage } from "../lib/api.js";
import { isoDate } from "../lib/format.js";
import { currentMonthRange } from "../lib/month.js";
import { Button, Card, Field, TextInput } from "../components/ui/index.jsx";

export default function ReportsView() {
  const { sendReport } = useDashboard();
  const { user } = useAuth();
  const toast = useToast();
  const today = isoDate(new Date());
  const defaults = currentMonthRange();
  const [start, setStart] = useState(defaults.start);
  const [end, setEnd] = useState(defaults.end);
  const [sending, setSending] = useState(false);

  const preset = (kind) => {
    const now = new Date();
    if (kind === "mtd") {
      const r = currentMonthRange();
      setStart(r.start);
      setEnd(r.end);
    } else if (kind === "last") {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      setStart(isoDate(s));
      setEnd(isoDate(e));
    } else if (kind === "30d") {
      const s = new Date(now);
      s.setDate(s.getDate() - 29);
      setStart(isoDate(s));
      setEnd(today);
    }
  };

  const submit = async () => {
    if (start > end) return toast.error("Start date must be on or before end date");
    setSending(true);
    try {
      const res = await sendReport(start, end);
      toast.success(
        res.dev
          ? `Dev mode — report saved to the server outbox (${res.to})`
          : `Report sent to ${res.to}`
      );
    } catch (e) {
      toast.error(apiErrorMessage(e, "Could not send the report"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-fg">Reports</h1>

      <Card className="max-w-lg p-5">
        <h3 className="text-sm font-semibold text-fg">Email an expense report</h3>
        <p className="mt-1 text-sm text-muted">
          A summary (totals, by category, by payment mode, full list) is emailed to{" "}
          <span className="font-medium text-fg">{user?.email}</span>.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["mtd", "This month"],
            ["last", "Last month"],
            ["30d", "Last 30 days"],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => preset(k)}
              className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted transition hover:bg-accent-soft hover:text-fg"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Field label="From">
            <TextInput type="date" value={start} max={end} onChange={(e) => setStart(e.target.value)} />
          </Field>
          <Field label="To">
            <TextInput
              type="date"
              value={end}
              min={start}
              max={today}
              onChange={(e) => setEnd(e.target.value)}
            />
          </Field>
        </div>

        <div className="mt-5 flex justify-end">
          <Button loading={sending} onClick={submit}>
            Send report
          </Button>
        </div>
      </Card>
    </div>
  );
}
