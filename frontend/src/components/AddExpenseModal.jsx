import AddExpenseForm from "./AddExpenseForm.jsx";
import { Modal } from "./ui/index.jsx";

export default function AddExpenseModal({ open, onClose, preset }) {
  return (
    <Modal open={open} onClose={onClose} title="Add expense">
      <AddExpenseForm onDone={onClose} preset={preset} />
    </Modal>
  );
}
