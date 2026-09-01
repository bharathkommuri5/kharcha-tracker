import { useState } from "react";
import { useDashboard } from "../context/DashboardContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { apiErrorMessage } from "../lib/api.js";
import { isoDate } from "../lib/format.js";
import AmountInput from "./AmountInput.jsx";
import CategoryChips from "./CategoryChips.jsx";
import PaymentModePicker from "./PaymentModePicker.jsx";
import { Button, Field, TextInput } from "./ui/index.jsx";

const emptyForm = (preset) => ({
  amount: "",
  category: preset?.category || "",
  payment_mode: "",
  note: "",
  transaction_date: isoDate(new Date()),
});

export default function AddExpenseForm({ onDone, preset }) {
  const { options, addTransaction } = useDashboard();
  const toast = useToast();
  const [form, setForm] = useState(() => emptyForm(preset));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v?.target ? v.target.value : v }));

  const validate = () => {
    const e = {};
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Enter an amount greater than 0";
    if (!form.category) e.category = "Pick a category";
    if (!form.payment_mode) e.payment_mode = "Pick a payment mode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await addTransaction({
        amount: Number(form.amount).toFixed(2),
        category: form.category,
        payment_mode: form.payment_mode,
        note: form.note.trim() || null,
        transaction_date: form.transaction_date,
      });
      setForm(emptyForm(preset));
      setErrors({});
      onDone?.();
    } catch (e) {
      toast.error(apiErrorMessage(e, "Could not save the expense"));
    } finally {
      setSaving(false);
    }
  };

  if (!options) return null;

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Category" error={errors.category}>
        <CategoryChips options={options.categories} value={form.category} onChange={set("category")} />
      </Field>

      <Field label="Payment mode" error={errors.payment_mode}>
        <PaymentModePicker
          options={options.payment_modes}
          value={form.payment_mode}
          onChange={set("payment_mode")}
        />
      </Field>

      <Field label="Amount" htmlFor="amount" error={errors.amount}>
        <AmountInput value={form.amount} onChange={set("amount")} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date" htmlFor="transaction_date">
          <TextInput
            id="transaction_date"
            type="date"
            value={form.transaction_date}
            max={isoDate(new Date())}
            onChange={set("transaction_date")}
          />
        </Field>
        <Field label="Note (optional)" htmlFor="note">
          <TextInput
            id="note"
            value={form.note}
            onChange={set("note")}
            placeholder="e.g. groceries"
            maxLength={280}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          Save expense
        </Button>
      </div>
    </form>
  );
}
