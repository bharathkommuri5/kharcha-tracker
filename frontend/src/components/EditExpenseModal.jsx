import { useState } from "react";
import { useDashboard } from "../context/DashboardContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { apiErrorMessage } from "../lib/api.js";
import { isoDate } from "../lib/format.js";
import AmountInput from "./AmountInput.jsx";
import CategoryChips from "./CategoryChips.jsx";
import PaymentModePicker from "./PaymentModePicker.jsx";
import { Button, Field, Modal, TextInput } from "./ui/index.jsx";

export default function EditExpenseModal({ tx, open, onClose }) {
  const { options, updateTransaction } = useDashboard();
  const toast = useToast();
  const [form, setForm] = useState(() => ({
    amount: String(tx.amount),
    category: tx.category,
    payment_mode: tx.payment_mode,
    note: tx.note || "",
    transaction_date: tx.transaction_date,
  }));
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v?.target ? v.target.value : v }));

  const save = async () => {
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("Enter an amount greater than 0");
      return;
    }
    setSaving(true);
    try {
      await updateTransaction(tx.id, {
        amount: Number(form.amount).toFixed(2),
        category: form.category,
        payment_mode: form.payment_mode,
        note: form.note.trim() || null,
        transaction_date: form.transaction_date,
      });
      onClose();
    } catch (e) {
      toast.error(apiErrorMessage(e, "Could not update the expense"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit expense"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={save}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Category">
          <CategoryChips options={options?.categories || []} value={form.category} onChange={set("category")} />
        </Field>
        <Field label="Payment mode">
          <PaymentModePicker
            options={options?.payment_modes || []}
            value={form.payment_mode}
            onChange={set("payment_mode")}
          />
        </Field>
        <Field label="Amount">
          <AmountInput value={form.amount} onChange={set("amount")} id="edit-amount" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <TextInput
              type="date"
              value={form.transaction_date}
              max={isoDate(new Date())}
              onChange={set("transaction_date")}
            />
          </Field>
          <Field label="Note">
            <TextInput value={form.note} onChange={set("note")} maxLength={280} placeholder="optional" />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
