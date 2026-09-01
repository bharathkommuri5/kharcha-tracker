import { useMemo, useState } from "react";
import { useDashboard } from "../context/DashboardContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { apiErrorMessage } from "../lib/api.js";
import { formatDayMonth, formatINR } from "../lib/format.js";
import EditExpenseModal from "./EditExpenseModal.jsx";
import PaymentIcon from "./PaymentIcon.jsx";
import { Button, EmptyState, Modal, Spinner } from "./ui/index.jsx";

function useLookups(options) {
  return useMemo(() => {
    const cat = {};
    const pay = {};
    (options?.categories || []).forEach((c) => (cat[c.value] = c));
    (options?.payment_modes || []).forEach((p) => (pay[p.value] = p));
    return { cat, pay };
  }, [options]);
}

function Row({ tx, cat, pay, onEdit, onDelete }) {
  const meta = cat[tx.category] || { icon: "•", label: tx.category, color: "#94a3b8" };
  return (
    <li className="group flex items-center gap-3 px-4 py-3 transition hover:bg-surface-2">
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
        style={{ backgroundColor: `${meta.color}22` }}
        title={meta.label}
      >
        {meta.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-fg">{meta.label}</p>
        <p className="flex items-center gap-1.5 truncate text-xs text-faint">
          <PaymentIcon mode={tx.payment_mode} size={14} />
          <span className="truncate">
            {formatDayMonth(tx.transaction_date)}
            {tx.note ? ` · ${tx.note}` : ""}
          </span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <p className="text-sm font-bold tabular-nums text-fg">{formatINR(tx.amount)}</p>
        <div className="flex w-0 justify-end gap-0.5 overflow-hidden opacity-0 transition-all group-hover:w-14 group-hover:opacity-100">
          <button
            onClick={() => onEdit(tx)}
            className="rounded-lg p-1.5 text-faint hover:bg-surface hover:text-fg"
            aria-label="Edit"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(tx)}
            className="rounded-lg p-1.5 text-faint hover:bg-negative/15 hover:text-negative"
            aria-label="Delete"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );
}

export default function TransactionList({ onAddExpense }) {
  const { transactions, loading, error, options, deleteTransaction, refresh } = useDashboard();
  const { cat, pay } = useLookups(options);
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteTransaction(deleting.id);
      setDeleting(null);
    } catch (e) {
      toast.error(apiErrorMessage(e, "Could not delete"));
    } finally {
      setBusy(false);
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center py-16 text-faint">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState icon="⚠️" title="Couldn't load expenses">
        {error}{" "}
        <button onClick={refresh} className="font-medium text-accent underline">
          Retry
        </button>
      </EmptyState>
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState icon="🧾" title="No expenses this month">
        <span className="block">Track your first spend for this month.</span>
        {onAddExpense && (
          <button onClick={onAddExpense} className="mt-2 font-semibold text-accent hover:underline">
            ＋ Add expense
          </button>
        )}
      </EmptyState>
    );
  }

  return (
    <>
      <ul className="divide-y divide-line">
        {transactions.map((tx) => (
          <Row key={tx.id} tx={tx} cat={cat} pay={pay} onEdit={setEditing} onDelete={setDeleting} />
        ))}
      </ul>

      {editing && <EditExpenseModal tx={editing} open onClose={() => setEditing(null)} />}

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete expense?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={busy} onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        {deleting && (
          <p className="text-sm text-muted">
            {formatINR(deleting.amount)} · {(cat[deleting.category] || {}).label} on{" "}
            {formatDayMonth(deleting.transaction_date)} will be removed.
          </p>
        )}
      </Modal>
    </>
  );
}
